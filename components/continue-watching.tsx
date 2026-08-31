"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

type CWItem = {
  id: string
  title: string
  thumb: string
  seconds: number
}

export function ContinueWatching() {
  const { user, ready } = useAuth()
  const [items, setItems] = useState<CWItem[]>([])

  useEffect(() => {
    if (!ready || !user) return
    Promise.all([
      fetch("/api/progress", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/films").then((r) => r.json()),
    ])
      .then(([prog, films]) => {
        const map: Record<string, number> = prog.progress ?? {}
        const videos: any[] = films.films ?? []
        const list = videos
          .filter((v) => map[v.id] > 0)
          .map((v) => ({
            id: v.id,
            title: v.title,
            thumb: v.thumbFileName,
            seconds: map[v.id],
          }))
        setItems(list)
      })
      .catch(() => setItems([]))
  }, [ready, user])

  if (!ready || !user || items.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <PlayCircle className="size-5 text-primary" /> Lanjut Menonton
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((film) => (
          <Link
            key={film.id}
            href={`/play/${film.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={film.thumb}
                alt={`Poster ${film.title}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-xs font-medium text-white">
                  {Math.floor(film.seconds / 60)}m {Math.floor(film.seconds % 60)}d ditonton
                </span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="line-clamp-1 text-sm font-semibold">{film.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
