import Link from "next/link"
import { Star, Film as FilmIcon } from "lucide-react"

import type { Film } from "@/lib/types"
import { WatchlistButton } from "@/components/watchlist-button"

export function MovieCard({ movie }: { movie: Film }) {
  return (
      <Link
        href={("videoFileName" in movie) ? `/play/${movie.id}` : `/film/${movie.id}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <WatchlistButton film={movie} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={("videoFileName" in movie) ? movie.thumbFileName : movie.poster || "/placeholder.svg"}
            alt={`Poster film ${movie.title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {movie.rating != null && movie.rating > 0 ? (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              <Star className="size-3 fill-current" />
              {movie.rating.toFixed(1)}
            </div>
          ) : (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
              <FilmIcon className="size-3" />
              <span>Lokal</span>
            </div>
          )}
        </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-balance font-semibold leading-tight">{movie.title}</h3>
          <span className="shrink-0 text-sm text-muted-foreground">
            {"year" in movie ? String(movie.year) : new Date(movie.createdAt).getFullYear()}
          </span>
        </div>

          {movie.genres?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {movie.genres.map((genre: string) => (
              <span
                key={genre}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {genre}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              Unggahan User
            </span>
          </div>
        )}

        <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          {"plot" in movie ? movie.plot : movie.description || "Deskripsi tidak tersedia"}
        </p>
      </div>
    </Link>
  )
}
