import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Star } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { VideoPlayer } from "@/components/video-player"
import { getVideoQualities } from "@/lib/video-quality"
import { getMovieById } from "@/lib/watchmode"

export const revalidate = 3600

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const movie = await getMovieById(Number(id))

  if (!movie) {
    notFound()
  }

  const qualities = getVideoQualities()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali ke daftar film
        </Link>

        <div className="grid gap-8 sm:grid-cols-[minmax(0,240px)_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={movie.poster || "/placeholder.svg"}
              alt={`Poster film ${movie.title}`}
              className="aspect-[2/3] h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight">{movie.title}</h1>
              <p className="mt-1 text-muted-foreground">{movie.year}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {movie.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                  <Star className="size-4 fill-current" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
              {movie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Sinopsis</h2>
              <p className="text-pretty leading-relaxed text-muted-foreground">{movie.plot}</p>
            </div>
          </div>
        </div>

        <VideoPlayer poster={movie.poster} title={movie.title} qualities={qualities} filmId={id} />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm. Sumber data: Watchmode API.
        </div>
      </footer>
    </div>
  )
}
