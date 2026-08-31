import "server-only"

const API_KEY = process.env.WATCHMODE_API_KEY ?? ""
const BASE_URL = "https://api.watchmode.com/v1"

// Berapa banyak film yang ditampilkan (sederhana, ambil sedikit data)
const MOVIE_LIMIT = 12

export type Movie = {
  id: number
  title: string
  year: number
  plot: string
  poster: string
  rating: number
  genres: string[]
}

type ListResponse = {
  titles: { id: number }[]
}

type DetailsResponse = {
  id: number
  title: string
  year: number
  plot_overview: string | null
  posterMedium: string | null
  poster: string | null
  user_rating: number | null
  genre_names: string[] | null
}

export async function getMovies(): Promise<Movie[]> {
  if (!API_KEY) {
    console.warn("WATCHMODE_API_KEY tidak diset. Rekomendasi film eksternal dinonaktifkan.")
    return []
  }

  // 1. Ambil daftar judul film paling populer
  const listRes = await fetch(
    `${BASE_URL}/list-titles/?apiKey=${API_KEY}&types=movie&sort_by=popularity_desc&limit=${MOVIE_LIMIT}`,
    { next: { revalidate: 3600 } },
  )

  if (!listRes.ok) {
    throw new Error("Gagal mengambil daftar film dari Watchmode")
  }

  const list = (await listRes.json()) as ListResponse
  const ids = list.titles.map((t) => t.id)

  // 2. Ambil detail tiap film (poster, plot, rating, genre)
  const details = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`${BASE_URL}/title/${id}/details/?apiKey=${API_KEY}`, {
        next: { revalidate: 3600 },
      })
      if (!res.ok) return null
      return (await res.json()) as DetailsResponse
    }),
  )

  return details
    .filter((d): d is DetailsResponse => d !== null && Boolean(d.posterMedium || d.poster))
    .map(toMovie)
}

function toMovie(d: DetailsResponse): Movie {
  return {
    id: d.id,
    title: d.title,
    year: d.year,
    plot: d.plot_overview ?? "Sinopsis belum tersedia.",
    poster: (d.posterMedium ?? d.poster) as string,
    rating: d.user_rating ?? 0,
    genres: (d.genre_names ?? []).slice(0, 3),
  }
}

// Ambil detail satu film berdasarkan id (untuk halaman detail)
export async function getMovieById(id: number): Promise<Movie | null> {
  const res = await fetch(`${BASE_URL}/title/${id}/details/?apiKey=${API_KEY}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const d = (await res.json()) as DetailsResponse
  if (!d?.id) return null
  return toMovie(d)
}
