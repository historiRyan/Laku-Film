"use client"

import { useEffect, useState } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { Film } from "@/lib/types"

export function WatchlistButton({ film }: { film: Film }) {
  const { user, ready } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const filmId = String(film.id)

  useEffect(() => {
    if (!user) return
    fetch("/api/watchlist", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const ids: string[] = (d.items ?? []).map((i: { id: string }) => i.id)
        setSaved(ids.includes(filmId))
      })
      .catch(() => {})
  }, [user, filmId])

  if (!ready || !user) return null

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      if (saved) {
        await fetch("/api/watchlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ filmId }),
        })
        setSaved(false)
      } else {
        const snapshot = {
          id: filmId,
          title: film.title,
          thumb: "videoFileName" in film ? film.thumbFileName : film.poster || "/placeholder.svg",
          year: "year" in film ? film.year : undefined,
          genres: film.genres,
          description: "plot" in film ? film.plot : film.description || "",
        }
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(snapshot),
        })
        setSaved(true)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? "Hapus dari watchlist" : "Tambah ke watchlist"}
      className="absolute left-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
    >
      {saved ? (
        <BookmarkCheck className="size-4 text-primary" />
      ) : (
        <Bookmark className="size-4" />
      )}
    </button>
  )
}
