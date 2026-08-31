import { readJson, writeJson } from "@/lib/store"

export type WatchlistItem = {
  id: string
  title: string
  thumb: string
  year?: number | string
  genres?: string[]
  description?: string
}

const DEFAULT: WatchlistItem[] = []

export function getWatchlistKey(username: string): string {
  return `watchlist:${username}`
}

export async function getWatchlist(username: string): Promise<WatchlistItem[]> {
  const data = (await readJson(getWatchlistKey(username))) as WatchlistItem[] | null
  return Array.isArray(data) ? data : DEFAULT
}

export async function addToWatchlist(username: string, item: WatchlistItem): Promise<WatchlistItem[]> {
  const list = await getWatchlist(username)
  if (!list.find((i) => i.id === item.id)) list.push(item)
  await writeJson(getWatchlistKey(username), list)
  return list
}

export async function removeFromWatchlist(username: string, filmId: string): Promise<WatchlistItem[]> {
  const list = (await getWatchlist(username)).filter((i) => i.id !== filmId)
  await writeJson(getWatchlistKey(username), list)
  return list
}

export async function isInWatchlist(username: string, filmId: string): Promise<boolean> {
  return (await getWatchlist(username)).some((i) => i.id === filmId)
}
