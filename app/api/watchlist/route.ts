import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const items = await getWatchlist(user.username)
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = (await request.json()) as Partial<WatchlistItem>
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 })
  }
  const item: WatchlistItem = {
    id: String(body.id),
    title: body.title ?? "Tanpa judul",
    thumb: body.thumb ?? "/placeholder.svg",
    year: body.year,
    genres: body.genres,
    description: body.description,
  }
  const list = await addToWatchlist(user.username, item)
  return NextResponse.json({ list })
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { filmId } = (await request.json()) as { filmId?: string }
  if (!filmId) {
    return NextResponse.json({ error: "filmId required" }, { status: 400 })
  }
  const list = await removeFromWatchlist(user.username, filmId)
  return NextResponse.json({ list })
}
