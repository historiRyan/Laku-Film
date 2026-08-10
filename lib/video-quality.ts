import type { QualityLabel, QualityOption } from "@/lib/types"

export const QUALITY_LABELS: QualityLabel[] = ["1080p", "720p", "360p"]

export const QUALITY_UPLOAD_FIELDS: Record<QualityLabel, string> = {
  "360p": "video_360",
  "720p": "video_720",
  "1080p": "video_1080",
}

export function getVideoQualities(
  videoFiles?: Partial<Record<QualityLabel, string>>,
  fallbackFileName?: string,
): QualityOption[] {
  return QUALITY_LABELS.map((label) => {
    const file = videoFiles?.[label] ?? (label === "1080p" ? fallbackFileName : undefined)
    return {
      label,
      src: file ? `/uploads/${file}` : "",
      available: Boolean(file),
    }
  })
}
