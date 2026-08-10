import { NextResponse } from "next/server"

import type { Series } from "@/lib/types"
import { readDataVideo, writeDataVideo } from "@/lib/data-video"

export async function GET() {
  const { series } = readDataVideo()
  return NextResponse.json({ series })
}

type CreateSeriesBody = {
  title: string
  description: string
  owner: string
  thumbFileName: string
  rating?: number
  genres?: string[]
  episodes?: Partial<Series["episodes"][number]>[]
}

export async function POST(request: Request) {
  let body: CreateSeriesBody
  try {
    body = (await request.json()) as CreateSeriesBody
  } catch {
    return NextResponse.json(
      { success: false, error: "Body harus berupa JSON yang valid." },
      { status: 400 },
    )
  }

  try {
    if (!body.title || !body.owner || !body.thumbFileName) {
      return NextResponse.json(
        { success: false, error: "Judul, pemilik, dan thumbnail wajib diisi." },
        { status: 400 },
      )
    }

    const { videos, series } = readDataVideo()
    const now = Date.now()
    const id = `${now}-${Math.random().toString(36).slice(2, 8)}-series`

    const newSeries: Series = {
      id,
      title: body.title.trim(),
      description: (body.description ?? "").trim(),
      owner: body.owner,
      thumbFileName: body.thumbFileName,
      createdAt: now,
      rating: body.rating,
      genres: body.genres,
      episodes: (body.episodes ?? []).map((ep) => ({
        id: ep.id ?? `${now}-${Math.random().toString(36).slice(2, 8)}-ep`,
        title: (ep.title ?? "").trim(),
        description: (ep.description ?? "").trim(),
        owner: ep.owner ?? body.owner,
        videoFileName: ep.videoFileName ?? "",
        videoFiles: ep.videoFiles,
        thumbFileName: ep.thumbFileName ?? body.thumbFileName,
        createdAt: ep.createdAt ?? now,
        rating: ep.rating,
        genres: ep.genres,
        episodeNumber: ep.episodeNumber ?? 1,
        seasonNumber: ep.seasonNumber,
        seriesId: id,
      })),
    }

    writeDataVideo({ videos, series: [newSeries, ...series] })
    return NextResponse.json({ success: true, series: newSeries })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan." },
      { status: 500 },
    )
  }
}
