import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

import type { Episode } from "@/lib/types"
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

function deleteUploadIfUnused(
  rel: string | undefined,
  used: Set<string>,
) {
  if (!rel) return
  if (used.has(rel)) return
  deleteUpload(rel)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; episodeId: string }> },
) {
  const { id, episodeId } = await params
  const { videos, series } = readDataVideo()
  const s = series.find((x) => x.id === id)
  if (!s) {
    return NextResponse.json(
      { success: false, error: "Series tidak ditemukan." },
      { status: 404 },
    )
  }

  const epIdx = s.episodes.findIndex((e) => e.id === episodeId)
  if (epIdx === -1) {
    return NextResponse.json(
      { success: false, error: "Episode tidak ditemukan." },
      { status: 404 },
    )
  }

  const ep: Episode = s.episodes[epIdx]
  const used = new Set<string>()
  for (const other of s.episodes) {
    if (other.id === episodeId) continue
    if (other.videoFileName) used.add(other.videoFileName)
    if (other.thumbFileName) used.add(other.thumbFileName)
    if (other.videoFiles) {
      for (const f of Object.values(other.videoFiles)) {
        if (f) used.add(f)
      }
    }
  }
  for (const v of videos) {
    if (v.videoFileName) used.add(v.videoFileName)
    if (v.thumbFileName) used.add(v.thumbFileName)
    if (v.videoFiles) {
      for (const f of Object.values(v.videoFiles)) {
        if (f) used.add(f)
      }
    }
  }

  deleteUploadIfUnused(ep.videoFileName, used)
  deleteUploadIfUnused(ep.thumbFileName, used)
  if (ep.videoFiles) {
    for (const f of Object.values(ep.videoFiles)) deleteUploadIfUnused(f, used)
  }

  s.episodes = s.episodes.filter((e) => e.id !== episodeId)
  writeDataVideo({ videos, series })
  return NextResponse.json({ success: true })
}
