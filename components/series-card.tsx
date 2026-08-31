import Link from "next/link"
import { Star, Tv } from "lucide-react"
import type { ReactNode } from "react"

import type { Series } from "@/lib/types"

export function SeriesCard({
  series,
  actions,
}: {
  series: Series
  actions?: ReactNode
}) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/series/${series.id}`}
        aria-label={`Buka ${series.title}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {actions ? (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
          {actions}
        </div>
      ) : null}

      <div className="relative z-0 flex flex-col">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={series.thumbFileName ? series.thumbFileName : "/placeholder.svg"}
            alt={`Thumbnail series ${series.title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-indigo-500/90 px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            <Tv className="size-3 fill-current" />
            Series
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground/90 backdrop-blur">
            <span>{series.episodes?.length ?? 0} episode</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-balance font-semibold leading-tight">{series.title}</h3>
            <span className="shrink-0 text-sm text-muted-foreground">
              {new Date(series.createdAt).getFullYear()}
            </span>
          </div>

          {series.genres && series.genres.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {series.genres.map((genre) => (
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

          <div className="flex items-center gap-1">
            {series.rating && series.rating > 0 ? (
              <>
                <Star className="size-3 shrink-0 fill-current text-amber-400" />
                <span className="text-sm font-medium text-muted-foreground">
                  {series.rating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Belum ada rating</span>
            )}
          </div>

          <p className="line-clamp-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            {series.description || "Deskripsi tidak tersedia."}
          </p>
        </div>
      </div>
    </div>
  )
}
