"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { MovieCard } from "@/components/movie-card"
import type { Film } from "@/lib/types"

type MovieBrowserProps = {
  movies: Film[]
}

function collectCategories(movies: Film[]): string[] {
  const set = new Set<string>()
  for (const movie of movies) {
    const genres = "genres" in movie ? movie.genres : undefined
    if (genres) {
      for (const g of genres) {
        if (g && g.trim()) set.add(g.trim())
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function MovieBrowser({ movies }: MovieBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [localSearch, setLocalSearch] = useState("")

  const categories = useMemo(() => collectCategories(movies), [movies])

  const filtered = useMemo(() => {
    let result = movies
    if (activeCategory) {
      result = result.filter((movie) => {
        const genres = "genres" in movie ? movie.genres : undefined
        return genres?.some((g) => g.trim().toLowerCase() === activeCategory.toLowerCase())
      })
    }
    if (localSearch.trim()) {
      const needle = localSearch.trim().toLowerCase()
      result = result.filter(
        (movie) =>
          ("title" in movie ? movie.title : "")
            .toLowerCase()
            .includes(needle) ||
          ("genres" in movie
            ? movie.genres?.some((g) => g.toLowerCase().includes(needle))
            : false),
      )
    }
    return result
  }, [movies, activeCategory, localSearch])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={[
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            activeCategory
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground",
          ].join(" ")}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
            className={[
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="relative max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari film di daftar..."
            aria-label="Cari film"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch("")}
              aria-label="Hapus pencarian"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">
          {localSearch || activeCategory
            ? "Tidak ada film yang cocok dengan filter ini."
            : "Belum ada film yang bisa ditampilkan."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((movie) => (
            <MovieCard key={`${movie.id}`} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
