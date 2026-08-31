import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist"
import { readDataVideo } from "@/lib/data-video"
import type { LocalFilm } from "@/lib/types"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const ids = await getWatchlist(user.username)
  const { videos, series } = readDataVideo()
  const all = [...videos, ...series]
  const items = ids
    .map((id) => all.find((v) => v.id === id))
    .filter((v): v is LocalFilm | (typeof series)[number] => Boolean(v))
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { filmId } = await request.json()
  if (!filmId) {
    return NextResponse.json({ error: "filmId required" }, { status: 400 })
  }
  const list = await addToWatchlist(user.username, filmId)
  return NextResponse.json({ list })
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { filmId } = await request.json()
  if (!filmId) {
    return NextResponse.json({ error: "filmId required" }, { status: 400 })
  }
  const list = await removeFromWatchlist(user.username, filmId)
  return NextResponse.json({ list })
}
