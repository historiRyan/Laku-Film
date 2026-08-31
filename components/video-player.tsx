"use client"

import { useEffect, useRef, useState } from "react"
import { Film as FilmIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { QualityLabel, QualityOption } from "@/lib/types"

type VideoPlayerProps = {
  poster: string
  title: string
  qualities: QualityOption[]
  filmId: string
  startTime?: number
  onProgress?: (seconds: number) => void
}

export function VideoPlayer({ poster, title, qualities, filmId, startTime = 0, onProgress }: VideoPlayerProps) {
  const [selected, setSelected] = useState<QualityLabel>("1080p")
  const videoRef = useRef<HTMLVideoElement>(null)
  const savedRef = useRef(false)

  useEffect(() => {
    const best = qualities.find((q) => q.available)?.label ?? "1080p"
    setSelected((prev) => (best === prev ? prev : best))
  }, [qualities])

  // Resume position
  useEffect(() => {
    const v = videoRef.current
    if (v && startTime > 0) {
      v.currentTime = startTime
    }
  }, [startTime, qualities])

  // Periodically report progress (every 5s)
  useEffect(() => {
    if (!onProgress) return
    const interval = setInterval(() => {
      const v = videoRef.current
      if (v && !v.paused && v.duration > 0) {
        onProgress(v.currentTime)
      }
    }, 5000)
    const onEnded = () => onProgress(videoRef.current?.duration ?? 0)
    const v = videoRef.current
    v?.addEventListener("ended", onEnded)
    return () => {
      clearInterval(interval)
      v?.removeEventListener("ended", onEnded)
    }
  }, [onProgress, filmId])

  const active = qualities.find((q) => q.label === selected)
  const availableCount = qualities.filter((q) => q.available).length

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold">Putar Film</h2>

      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-sm">
        {active?.available && active.src ? (
          <video
            key={active.src}
            ref={videoRef}
            src={active.src}
            controls
            poster={poster}
            className="aspect-video w-full object-cover bg-black"
          />
        ) : (
          <div className="relative flex aspect-video w-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={poster || "/placeholder.svg"}
              alt={`Poster film ${title}`}
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="relative flex flex-col items-center gap-2 text-muted-foreground">
              <FilmIcon className="size-8" />
              <span className="text-sm">Video belum tersedia.</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Kualitas:</span>
        {qualities.map((q) => (
          <button
            key={q.label}
            type="button"
            disabled={!q.available}
            onClick={() => q.available && setSelected(q.label)}
            className={cn(
              "rounded-md border px-3 py-1 text-sm font-medium transition-colors",
              q.available && selected === q.label
                ? "border-primary bg-primary text-primary-foreground"
                : q.available
                  ? "border-border bg-background text-foreground hover:bg-accent"
                  : "cursor-not-allowed opacity-50",
            )}
          >
            {q.label}
          </button>
        ))}
      </div>
    </section>
  )
}
