import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getAllProgress, setProgress } from "@/lib/progress"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const progress = await getAllProgress(user.username)
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { filmId, seconds } = (await request.json()) as { filmId?: string; seconds?: number }
  if (!filmId || typeof seconds !== "number") {
    return NextResponse.json({ error: "filmId & seconds required" }, { status: 400 })
  }
  await setProgress(user.username, filmId, seconds)
  return NextResponse.json({ ok: true })
}
