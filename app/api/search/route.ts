import { NextResponse } from "next/server"

import { readDataVideo } from "@/lib/data-video"
import type { LocalFilm, Series } from "@/lib/types"

export type LocalSearchResult = {
  id: string
  title: string
  year: number
  poster: string
  type: "film" | "series"
}

function toResult(v: { id: string; title: string; createdAt: number; thumbFileName?: string }, type: "film" | "series"): LocalSearchResult {
  return {
    id: v.id,
    title: v.title,
    year: new Date(v.createdAt).getFullYear(),
    poster: v.thumbFileName ? `/uploads/${v.thumbFileName}` : "/placeholder.svg",
    type,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") ?? "").trim().toLowerCase()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const { videos, series } = readDataVideo()

    const results: LocalSearchResult[] = [
      ...(videos as LocalFilm[])
        .filter(
          (v) =>
            v.title.toLowerCase().includes(query) ||
            (v.genres ?? []).some((g) => g.toLowerCase().includes(query)),
        )
        .map((v) => toResult(v, "film")),
      ...(series as Series[])
        .filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            (s.genres ?? []).some((g) => g.toLowerCase().includes(query)),
        )
        .map((s) => toResult(s, "series")),
    ]

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
