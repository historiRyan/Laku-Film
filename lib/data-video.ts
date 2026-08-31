import { readJson, writeJson } from "@/lib/store"
import type { LocalFilm, Episode, Series } from "@/lib/types"

export type { LocalFilm, Episode, Series }

export function readDataVideo(): { videos: LocalFilm[]; series: Series[] } {
  const data = (readJsonSync("data-video") as { videos: LocalFilm[]; series: Series[] }) ?? {
    videos: [] as LocalFilm[],
    series: [] as Series[],
  }
  if (!Array.isArray(data.videos)) data.videos = []
  if (!Array.isArray(data.series)) data.series = []
  return data
}

function readJsonSync(key: string): unknown | null {
  if (process.env.UPSTASH_REDIS_REST_URL) return null
  const fs = require("fs")
  const path = require("path")
  const filePath = path.join(process.cwd(), "lib", `${key}.json`)
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    return null
  }
}

export async function writeDataVideo(data: { videos: LocalFilm[]; series: Series[] }): Promise<void> {
  await writeJson("data-video", data)
}

export async function getLocalFilm(id: string): Promise<LocalFilm | undefined> {
  return readDataVideo().videos.find((v) => v.id === id)
}

export async function getEpisodeById(id: string): Promise<Episode | undefined> {
  for (const s of readDataVideo().series) {
    const ep = s.episodes.find((e) => e.id === id)
    if (ep) return ep
  }
  return undefined
}

export async function findSeriesForEpisode(episodeId: string): Promise<Series | undefined> {
  return readDataVideo().series.find((s) => s.episodes.some((e) => e.id === episodeId))
}

export function getSeries(id: string): Series | undefined {
  return readDataVideo().series.find((s) => s.id === id)
}

export async function addVideo(video: LocalFilm): Promise<void> {
  const data = readDataVideo()
  data.videos = [video, ...data.videos]
  await writeDataVideo(data)
}

export async function addSeries(series: Series): Promise<void> {
  const data = readDataVideo()
  data.series = [series, ...data.series]
  await writeDataVideo(data)
}

export async function updateSeries(id: string, patch: Partial<Series>): Promise<void> {
  const data = readDataVideo()
  data.series = data.series.map((s) => (s.id === id ? { ...s, ...patch } : s))
  await writeDataVideo(data)
}

export async function deleteSeries(id: string): Promise<void> {
  const data = readDataVideo()
  data.series = data.series.filter((s) => s.id !== id)
  await writeDataVideo(data)
}
