import type { Movie } from "./watchmode"

export type QualityLabel = "360p" | "720p" | "1080p"

export type QualityOption = {
  label: QualityLabel
  src: string
  available: boolean
}

export type PlayableFilm = {
  id: string
  title: string
  description: string
  owner: string
  videoFileName: string
  videoFiles?: Partial<Record<QualityLabel, string>>
  thumbFileName: string
  createdAt: number
  year?: number
  plot?: string
  rating?: number
  genres?: string[]
}

export type LocalFilm = PlayableFilm

export type Episode = PlayableFilm & {
  episodeNumber: number
  seasonNumber?: number
  seriesId: string
}

export type Series = {
  id: string
  title: string
  description: string
  owner: string
  thumbFileName: string
  createdAt: number
  rating?: number
  genres?: string[]
  episodes: Episode[]
}

export type Film = Movie | LocalFilm
