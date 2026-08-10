import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

import type { LocalFilm, Series } from "@/lib/types"
import { readDataVideo, writeDataVideo } from "@/lib/data-video"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

function deleteUpload(rel: string | undefined) {
  if (!rel) return
  try {
    const full = path.join(UPLOADS_DIR, rel)
    if (fs.existsSync(full)) fs.unlinkSync(full)
  } catch {
    // ignore
  }
}

const collectUsedFiles = (
  videos: LocalFilm[],
  series: Series[],
): Set<string> => {
  const used = new Set<string>()
  for (const v of videos) {
    if (v.videoFileName) used.add(v.videoFileName)
    if (v.thumbFileName) used.add(v.thumbFileName)
    if (v.videoFiles) {
      for (const f of Object.values(v.videoFiles)) {
        if (f) used.add(f)
      }
    }
  }
  for (const s of series) {
    if (s.thumbFileName) used.add(s.thumbFileName)
    for (const ep of s.episodes) {
      if (ep.videoFileName) used.add(ep.videoFileName)
      if (ep.thumbFileName) used.add(ep.thumbFileName)
      if (ep.videoFiles) {
        for (const f of Object.values(ep.videoFiles)) {
          if (f) used.add(f)
        }
      }
    }
  }
  return used
}

function deleteUploadIfUnused(
  rel: string | undefined,
  used: Set<string>,
) {
  if (!rel) return
  if (used.has(rel)) return
  deleteUpload(rel)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const film = readDataVideo().videos.find((v) => v.id === id)
  if (!film) {
    return NextResponse.json({ success: false, error: "Film tidak ditemukan" }, { status: 404 })
  }
  return NextResponse.json({ film })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { videos, series } = readDataVideo()
  const film = videos.find((v) => v.id === id)
  if (!film) {
    return NextResponse.json({ success: false, error: "Film tidak ditemukan" }, { status: 404 })
  }

  const localFilm = film as LocalFilm
  const used = collectUsedFiles(videos, series)
  deleteUploadIfUnused(localFilm.videoFileName, used)
  deleteUploadIfUnused(localFilm.thumbFileName, used)
  if (localFilm.videoFiles) {
    for (const file of Object.values(localFilm.videoFiles)) {
      deleteUploadIfUnused(file, used)
    }
  }

  writeDataVideo({ videos: videos.filter((v) => v.id !== id), series })
  return NextResponse.json({ success: true })
}

type UpdateBody = Partial<{
  title: string
  description: string
  rating: number
  genres: string[]
  videoFileName: string
  videoFiles: Partial<Record<string, string>>
  thumbFileName: string
}>

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = (await request.json()) as UpdateBody
  const { videos, series } = readDataVideo()
  const idx = videos.findIndex((v) => v.id === id)
  if (idx === -1) {
    return NextResponse.json({ success: false, error: "Film tidak ditemukan" }, { status: 404 })
  }

  const film = videos[idx] as LocalFilm

  // Ganti berkas: hapus berkas lama yang diganti agar tidak orphan
  const used = collectUsedFiles(
    videos.filter((v) => v.id !== id),
    series,
  )
  if (body.thumbFileName && body.thumbFileName !== film.thumbFileName) {
    deleteUploadIfUnused(film.thumbFileName, used)
    film.thumbFileName = body.thumbFileName
  }
  if (body.videoFileName && body.videoFileName !== film.videoFileName) {
    deleteUploadIfUnused(film.videoFileName, used)
    film.videoFileName = body.videoFileName
  }
  if (body.videoFiles && Object.keys(body.videoFiles).length > 0) {
    const oldFiles = film.videoFiles ? Object.values(film.videoFiles) : []
    for (const oldFile of oldFiles) {
      const stillUsed = Object.values(body.videoFiles ?? {}).includes(oldFile)
      if (!stillUsed) deleteUploadIfUnused(oldFile, used)
    }
    film.videoFiles = body.videoFiles as LocalFilm["videoFiles"]
  }

  if (typeof body.title === "string") film.title = body.title.trim()
  if (typeof body.description === "string") film.description = body.description.trim()
  if (typeof body.rating === "number") film.rating = body.rating
  if (Array.isArray(body.genres)) film.genres = body.genres

  writeDataVideo({ videos, series })
  return NextResponse.json({ success: true, film: videos[idx] })
}
