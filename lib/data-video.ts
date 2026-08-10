import fs from "fs"
import path from "path"

import type { Episode, LocalFilm, Series } from "@/lib/types"

export const DATA_PATH = path.join(process.cwd(), "lib", "data-video.json")

export interface DataVideoFile {
  videos: LocalFilm[]
  series: Series[]
}

export function readDataVideo(): DataVideoFile {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf-8")
    const parsed = JSON.parse(raw)
    return {
      videos: Array.isArray(parsed.videos) ? (parsed.videos as LocalFilm[]) : [],
      series: Array.isArray(parsed.series) ? (parsed.series as Series[]) : [],
    }
  } catch {
    return { videos: [], series: [] }
  }
}

export function writeDataVideo(data: DataVideoFile) {
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

export function getLocalFilm(id: string): LocalFilm | null {
  const { videos } = readDataVideo()
  return videos.find((v) => v.id === id) ?? null
}

export function getEpisode(seriesId: string, episodeId: string): Episode | null {
  const { series } = readDataVideo()
  const series_ = series.find((s) => s.id === seriesId)
  if (!series_) return null
  return series_.episodes.find((e) => e.id === episodeId) ?? null
}

export function getEpisodeById(id: string): Episode | null {
  const { series } = readDataVideo()
  for (const s of series) {
    const ep = s.episodes.find((e) => e.id === id)
    if (ep) return ep
  }
  return null
}

export function findSeriesForEpisode(episodeId: string): Series | null {
  const { series } = readDataVideo()
  return series.find((s) => s.episodes.some((e) => e.id === episodeId)) ?? null
}

export function getSeries(id: string): Series | null {
  const { series } = readDataVideo()
  return series.find((s) => s.id === id) ?? null
}

export function findSeriesIndex(id: string): number {
  const { series } = readDataVideo()
  return series.findIndex((s) => s.id === id)
}
