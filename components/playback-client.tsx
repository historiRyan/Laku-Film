"use client"

import { useEffect, useState } from "react"
import { VideoPlayer } from "@/components/video-player"
import { useAuth } from "@/components/auth-provider"
import type { QualityOption } from "@/lib/types"

export function PlaybackClient({
  filmId,
  poster,
  title,
  qualities,
}: {
  filmId: string
  poster: string
  title: string
  qualities: QualityOption[]
}) {
  const { user, ready } = useAuth()
  const [startTime, setStartTime] = useState(0)

  useEffect(() => {
    if (!ready || !user) return
    fetch("/api/progress", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStartTime((d.progress ?? {})[filmId] ?? 0))
      .catch(() => setStartTime(0))
  }, [ready, user, filmId])

  function saveProgress(seconds: number) {
    if (!user) return
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ filmId, seconds }),
    }).catch(() => {})
  }

  return (
    <VideoPlayer
      filmId={filmId}
      poster={poster}
      title={title}
      qualities={qualities}
      startTime={startTime}
      onProgress={saveProgress}
    />
  )
}
