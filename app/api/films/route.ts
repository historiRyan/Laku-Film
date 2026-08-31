import { NextResponse } from "next/server"
import { readDataVideo, writeDataVideo, addVideo } from "@/lib/data-video"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const { videos } = readDataVideo()
  return NextResponse.json({ films: videos })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Hanya admin yang dapat mengunggah film." },
      { status: 403 },
    )
  }

  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Unggah film harus menggunakan form-data." },
        { status: 400 },
      )
    }

    const form = await request.formData()
    const title = String(form.get("title") ?? "").trim()
    const description = String(form.get("description") ?? "").trim()
    const ratingRaw = String(form.get("rating") ?? "")
    const genresRaw = String(form.get("genres") ?? "")
    const videoFileName = String(form.get("videoFileName") ?? "")
    const thumbFileName = String(form.get("thumbFileName") ?? "")
    const videoFilesRaw = String(form.get("videoFiles") ?? "")

    if (!title) {
      return NextResponse.json({ ok: false, error: "Judul film wajib diisi." }, { status: 400 })
    }
    if (!videoFileName || !thumbFileName) {
      return NextResponse.json(
        { ok: false, error: "Berkas video dan thumbnail wajib diunggah." },
        { status: 400 },
      )
    }

    let videoFiles: Partial<Record<string, string>> = {}
    if (videoFilesRaw) {
      try {
        videoFiles = JSON.parse(videoFilesRaw)
      } catch {
        videoFiles = {}
      }
    }

    const rating = ratingRaw ? Number(ratingRaw) : 0
    const genres = genresRaw
      ? genresRaw.split(",").map((g) => g.trim()).filter(Boolean)
      : []

    const newFilm = {
      id: videoFileName.split("/").pop()?.split(".")[0] || `film-${Date.now()}`,
      title,
      description,
      owner: user.username,
      videoFileName,
      videoFiles,
      thumbFileName,
      createdAt: Date.now(),
      rating,
      genres,
    }

    await addVideo(newFilm)

    return NextResponse.json({ ok: true, film: newFilm })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ ok: false, error: "Gagal menyimpan film." }, { status: 500 })
  }
}
