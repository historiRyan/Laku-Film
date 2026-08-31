import { readJson, writeJson } from "@/lib/store"

const DEFAULT: string[] = []

export function getWatchlistKey(username: string): string {
  return `watchlist:${username}`
}

export async function getWatchlist(username: string): Promise<string[]> {
  const data = (await readJson(getWatchlistKey(username))) as string[] | null
  return Array.isArray(data) ? data : DEFAULT
}

export async function addToWatchlist(username: string, filmId: string): Promise<string[]> {
  const list = await getWatchlist(username)
  if (!list.includes(filmId)) list.push(filmId)
  await writeJson(getWatchlistKey(username), list)
  return list
}

export async function removeFromWatchlist(username: string, filmId: string): Promise<string[]> {
  const list = (await getWatchlist(username)).filter((id) => id !== filmId)
  await writeJson(getWatchlistKey(username), list)
  return list
}

export async function isInWatchlist(username: string, filmId: string): Promise<boolean> {
  return (await getWatchlist(username)).includes(filmId)
}
