import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { IncomingForm } from "formidable"

import { QUALITY_LABELS, QUALITY_UPLOAD_FIELDS } from "@/lib/video-quality"
import type { QualityLabel } from "@/lib/types"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

async function parseMultipartForm(req: Request): Promise<{ fields: Record<string, string>; files: Record<string, { filepath: string; originalFilename?: string; mimetype?: string; size: number }[]> }> {
  const formData = await req.formData()
  const uploadDir = path.join(process.cwd(), "public", "uploads")

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const fields: Record<string, string> = {}
  const files: Record<string, { filepath: string; originalFilename?: string; mimetype?: string; size: number }[]> = {}

  for (const [key, value] of formData.entries()) {
    if (typeof value === "object" && "arrayBuffer" in value) {
      const file = value as File
      const buffer = await file.arrayBuffer()
      const filePath = path.join(
        uploadDir,
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${path.extname(file.name || "")}`,
      )

      await fs.promises.writeFile(filePath, Buffer.from(buffer))

      files[key] = [
        {
          filepath: filePath,
          originalFilename: file.name,
          mimetype: file.type,
          size: file.size,
        },
      ]
    } else {
      fields[key] = String(value)
    }
  }

  return { fields, files }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Endpoint ini hanya menerima multipart/form-data (unggah berkas)." },
        { status: 400 },
      )
    }

    const { files } = await parseMultipartForm(request)

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

    return NextResponse.json({
      success: true,
      videoFiles,
      videoFileName: bestFileName,
      thumbnailFileName: thumbFileName,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mengunggah berkas." },
      { status: 500 },
    )
  }
}
