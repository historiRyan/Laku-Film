import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

import type { Episode, LocalFilm, Series } from "@/lib/types"
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

function collectUsedFiles(
  videos: LocalFilm[],
  series: Series[],
): Set<string> {
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

function videoFilesRecord(
  src: Partial<Record<string, string>> | undefined,
): Record<string, string> | undefined {
  if (!src) return undefined
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(src)) {
    if (v != null) out[k] = v as string
  }
  return out
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { series } = readDataVideo()
  const s = series.find((x) => x.id === id)
  if (!s) {
    return NextResponse.json(
      { success: false, error: "Series tidak ditemukan." },
      { status: 404 },
    )
  }
  return NextResponse.json({ series: s })
}

type UpdateSeriesBody = Partial<{
  title: string
  description: string
  rating: number
  genres: string[]
  thumbFileName: string
  episodes: Partial<Episode>[]
}>

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = (await request.json()) as UpdateSeriesBody
  const { videos, series } = readDataVideo()
  const idx = series.findIndex((s) => s.id === id)
  if (idx === -1) {
    return NextResponse.json(
      { success: false, error: "Series tidak ditemukan." },
      { status: 404 },
    )
  }

  const s = series[idx]

  if (Array.isArray(body.episodes)) {
    const byId = new Map<string, Episode>()
    for (const e of s.episodes) byId.set(e.id, e)

    const newEpisodes: Episode[] = body.episodes.map((ep) => {
      const existing = ep.id ? byId.get(ep.id) : undefined
      const newVideoFiles = videoFilesRecord(ep.videoFiles ?? existing?.videoFiles)

      const merged: Episode = {
        id: ep.id ?? existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-ep`,
        title: ep.title ?? existing?.title ?? "",
        description: ep.description ?? existing?.description ?? "",
        owner: ep.owner ?? existing?.owner ?? s.owner,
        videoFileName: ep.videoFileName ?? existing?.videoFileName ?? "",
        videoFiles: newVideoFiles,
        thumbFileName: ep.thumbFileName ?? existing?.thumbFileName ?? s.thumbFileName,
        createdAt: ep.createdAt ?? existing?.createdAt ?? Date.now(),
        rating: ep.rating ?? existing?.rating,
        genres: ep.genres ?? existing?.genres,
        episodeNumber: ep.episodeNumber ?? existing?.episodeNumber ?? 1,
        seasonNumber: ep.seasonNumber ?? existing?.seasonNumber,
        seriesId: id,
      }
      return merged
    })

    const newIds = new Set(newEpisodes.map((e) => e.id))

    // Hitung file yang masih dipakai setelah perubahan
    const used = collectUsedFiles(videos, series)
    for (const ep of newEpisodes) {
      if (ep.videoFileName) used.add(ep.videoFileName)
      if (ep.thumbFileName) used.add(ep.thumbFileName)
      if (ep.videoFiles) {
        for (const f of Object.values(ep.videoFiles)) {
          if (f) used.add(f)
        }
      }
    }

    for (const ep of s.episodes) {
      if (!newIds.has(ep.id)) {
        deleteUploadIfUnused(ep.videoFileName, used)
        deleteUploadIfUnused(ep.thumbFileName, used)
        if (ep.videoFiles) {
          for (const f of Object.values(ep.videoFiles)) deleteUploadIfUnused(f, used)
        }
      }
    }

    s.episodes = newEpisodes
  }

  if (body.thumbFileName && body.thumbFileName !== s.thumbFileName) {
    const used = collectUsedFiles(videos, series.filter((x) => x.id !== id))
    deleteUploadIfUnused(s.thumbFileName, used)
    s.thumbFileName = body.thumbFileName
  }
  if (typeof body.title === "string") s.title = body.title.trim()
  if (typeof body.description === "string") s.description = body.description.trim()
  if (typeof body.rating === "number") s.rating = body.rating
  if (Array.isArray(body.genres)) s.genres = body.genres

  writeDataVideo({ videos, series })
  return NextResponse.json({ success: true, series: s })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { videos, series } = readDataVideo()
  const idx = series.findIndex((s) => s.id === id)
  if (idx === -1) {
    return NextResponse.json(
      { success: false, error: "Series tidak ditemukan." },
      { status: 404 },
    )
  }

  const s = series[idx]
  const used = collectUsedFiles(
    videos,
    series.filter((x) => x.id !== id),
  )
  deleteUploadIfUnused(s.thumbFileName, used)
  for (const ep of s.episodes) {
    deleteUploadIfUnused(ep.videoFileName, used)
    deleteUploadIfUnused(ep.thumbFileName, used)
    if (ep.videoFiles) {
      for (const f of Object.values(ep.videoFiles)) deleteUploadIfUnused(f, used)
    }
  }

  writeDataVideo({ videos, series: series.filter((x) => x.id !== id) })
  return NextResponse.json({ success: true })
}
