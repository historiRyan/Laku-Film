import { NextResponse } from "next/server"
import { QUALITY_LABELS, QUALITY_UPLOAD_FIELDS } from "@/lib/video-quality"
import { saveFile } from "@/lib/store"
import type { QualityLabel } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Endpoint ini hanya menerima multipart/form-data (unggah berkas)." },
        { status: 400 },
      )
    }

    const formData = await request.formData()
    const files = formData.entries()
    const collected: Record<string, { filepath: string; url: string }> = {}

    for (const [field, value] of files) {
      if (typeof value === "object" && "arrayBuffer" in value) {
        const file = value as File
        const buffer = Buffer.from(await file.arrayBuffer())
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${file.name?.replace(/[^\w.-]/g, "_") ?? ""}`
        const saved = await saveFile(safeName, buffer, file.type || "application/octet-stream")
        collected[field] = { filepath: saved.key, url: saved.url }
      }
    }

    const thumbnail = collected["thumbnail"]
    const videoFiles: Partial<Record<QualityLabel, string>> = {}
    let bestFileName: string | null = null

    for (const label of QUALITY_LABELS) {
      const f = collected[QUALITY_UPLOAD_FIELDS[label]]
      if (f) {
        videoFiles[label] = f.url
        if (label === "1080p" || !bestFileName) bestFileName = f.url
      }
    }

    return NextResponse.json({
      success: true,
      videoFiles,
      videoFileName: bestFileName,
      thumbnailFileName: thumbnail?.url ?? null,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mengunggah berkas." },
      { status: 500 },
    )
  }
}
