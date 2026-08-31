import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getComments, addComment } from "@/lib/comments"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const comments = await getComments(id)
  return NextResponse.json({ comments })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { text, rating } = (await request.json()) as { text?: string; rating?: number }
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Komentar kosong" }, { status: 400 })
  }
  const comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: user.username,
    text: text.trim(),
    rating: typeof rating === "number" ? rating : undefined,
    createdAt: Date.now(),
  }
  const list = await addComment(id, comment)
  return NextResponse.json({ comments: list })
}
