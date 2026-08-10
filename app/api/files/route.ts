import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { IncomingForm } from "formidable"

import { QUALITY_LABELS, QUALITY_UPLOAD_FIELDS } from "@/lib/video-quality"
import type { QualityLabel } from "@/lib/types"

async function parseMultipartForm(req: Request): Promise<{ fields: any; files: any }> {
  const formData = await req.formData();
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => {
      return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    },
  });

  const fields: any = {};
  const files: any = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'object' && 'arrayBuffer' in value) {
      const file = value as File;
      const buffer = await file.arrayBuffer();
      const filePath = path.join(uploadDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.name)}`);

      await fs.promises.writeFile(filePath, Buffer.from(buffer));

      files[key] = [{
        filepath: filePath,
        originalFilename: file.name,
        mimetype: file.type,
        size: file.size
      }];
    } else {
      fields[key] = value;
    }
  }

  return { fields, files };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")

    if (contentType && contentType.includes("multipart/form-data")) {
      console.log("Received multipart/form-data request.")
      const { fields, files } = await parseMultipartForm(request)

      const thumbnailFile = files.thumbnail?.[0]
      let thumbFileName: string | null = null
      if (thumbnailFile) {
        thumbFileName = path.basename(thumbnailFile.filepath)
      }

      const videoFiles: Partial<Record<QualityLabel, string>> = {}
      let bestFileName: string | null = null

      for (const label of QUALITY_LABELS) {
        const file = files[QUALITY_UPLOAD_FIELDS[label]]?.[0]
        if (file) {
          const name = path.basename(file.filepath)
          videoFiles[label] = name
          if (label === "1080p" || !bestFileName) {
            bestFileName = name
          }
        }
      }

      if (!bestFileName) {
        console.warn("No video file provided in this upload request.")
      }

      console.log("Files uploaded successfully:", {
        videoFiles,
        videoFileName: bestFileName,
        thumbnailFileName: thumbFileName,
      })
      return NextResponse.json({
        success: true,
        videoFiles,
        videoFileName: bestFileName,
        thumbnailFileName: thumbFileName,
      })

    } else {
      const { operation, filePath, data } = await request.json()
      const fullPath = path.join(process.cwd(), filePath)

      switch (operation) {
        case "read":
          const content = fs.readFileSync(fullPath, "utf-8")
          return NextResponse.json({ success: true, data: content })

        case "write":
          fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
          return NextResponse.json({ success: true })

        default:
          return NextResponse.json(
            { success: false, error: "Operasi tidak valid" },
            { status: 400 })
      }
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan" },
      { status: 500 }
    )
  }
}
