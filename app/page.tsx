import { SiteHeader } from "@/components/site-header"
import { HomeBrowser } from "@/components/home-browser"
import { getMovies } from "@/lib/watchmode"
import { readDataVideo } from "@/lib/data-video"
import type { LocalFilm, Series } from "@/lib/types"

export const revalidate = 3600

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const defaultTab = sp.tab === "series" ? "series" : "movie"

  const [watchmodeMovies, localMovies, localSeries] = await Promise.all([
    getMovies(),
    new Promise<LocalFilm[]>((resolve) => {
      try {
        const { videos } = readDataVideo()
        resolve(videos || [])
      } catch {
        resolve([])
      }
    }),
    new Promise<Series[]>((resolve) => {
      try {
        const { series } = readDataVideo()
        resolve(series || [])
      } catch {
        resolve([])
      }
    }),
  ])

  const movies = [...watchmodeMovies, ...localMovies]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 max-w-2xl">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Film populer pilihan LakuFilm
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Kumpulan film dan series paling populer saat ini, lengkap dengan poster,
            rating, dan sinopsis singkat. Data diambil langsung dari Watchmode.
          </p>
        </section>

        <HomeBrowser movies={movies} series={localSeries} defaultTab={defaultTab} />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} LakuFilm. Sumber data: Watchmode API.
        </div>
      </footer>
    </div>
  )
}
