import { readJson, writeJson } from "@/lib/store"

export type ProgressMap = Record<string, number> // filmId -> seconds

export function getProgressKey(username: string): string {
  return `progress:${username}`
}

export async function getAllProgress(username: string): Promise<ProgressMap> {
  const data = (await readJson(getProgressKey(username))) as ProgressMap | null
  return data && typeof data === "object" ? data : {}
}

export async function getProgress(username: string, filmId: string): Promise<number> {
  return (await getAllProgress(username))[String(filmId)] ?? 0
}

export async function setProgress(username: string, filmId: string, seconds: number): Promise<void> {
  const map = await getAllProgress(username)
  map[String(filmId)] = Math.max(0, Math.floor(seconds))
  await writeJson(getProgressKey(username), map)
}
