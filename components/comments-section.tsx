"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { Comment } from "@/lib/comments"

export function CommentsSection({ filmId }: { filmId: string }) {
  const { user, ready } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState("")
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    const r = await fetch(`/api/comments/${filmId}`, { credentials: "include" })
    const d = await r.json()
    setComments(d.comments ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filmId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await fetch(`/api/comments/${filmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, rating: rating || undefined }),
    })
    setText("")
    setRating(0)
    load()
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">Ulasan & Komentar</h2>

      {ready && user ? (
        <form onSubmit={submit} className="mb-6 rounded-xl border border-border p-4">
          <div className="mb-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setRating(n)}
                aria-label={`Beri ${n} bintang`}
                className={n <= rating ? "text-primary" : "text-muted-foreground"}
              >
                <Star className="size-5" fill={n <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis ulasan..."
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Kirim
          </button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">Login untuk menulis ulasan.</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada ulasan.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-border p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{c.username}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              {c.rating ? (
                <div className="mb-1 flex items-center gap-0.5 text-primary">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-3.5" fill={n <= c.rating! ? "currentColor" : "none"} />
                  ))}
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
