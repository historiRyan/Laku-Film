/**
 * Storage abstraction.
 *
 * - On Vercel (or any environment with UPSTASH_REDIS_REST_URL + BLOB_READ_WRITE_TOKEN):
 *   data lives in Upstash Redis, uploaded files live in Vercel Blob.
 * - Locally (no those env vars): data + files live on the filesystem so `npm run dev` works.
 *
 * Note: fs/path are required lazily inside functions so this module can be imported
 * in any runtime (Edge or Node) without pulling in Node built-ins at module load.
 */

const isVercel = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.BLOB_READ_WRITE_TOKEN,
)

/* ------------------------------------------------------------------ */
/* Data (JSON)                                                        */
/* ------------------------------------------------------------------ */

export async function readJson(key: string): Promise<unknown | null> {
  if (isVercel) {
    const { Redis } = await import("@upstash/redis")
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    return (await redis.get(key)) ?? null
  }
  const fs = await import("fs")
  const path = await import("path")
  const filePath =
    key === "data-video"
      ? path.join(process.cwd(), "lib", "data-video.json")
      : key === "users"
        ? path.join(process.cwd(), "lib", "users.json")
        : null
  if (!filePath) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    return null
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  if (isVercel) {
    const { Redis } = await import("@upstash/redis")
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.set(key, value)
    return
  }
  const fs = await import("fs")
  const path = await import("path")
  const filePath =
    key === "data-video"
      ? path.join(process.cwd(), "lib", "data-video.json")
      : key === "users"
        ? path.join(process.cwd(), "lib", "users.json")
        : null
  if (!filePath) return
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2))
}

/* ------------------------------------------------------------------ */
/* Files (video / thumbnail)                                          */
/* ------------------------------------------------------------------ */

export type SavedFile = { key: string; url: string }

export async function saveFile(
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<SavedFile> {
  if (isVercel) {
    const { put } = await import("@vercel/blob")
    const blob = await put(fileName, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { key: blob.pathname, url: blob.url }
  }
  const fs = await import("fs")
  const path = await import("path")
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  const filePath = path.join(UPLOADS_DIR, fileName)
  fs.writeFileSync(filePath, buffer)
  return { key: fileName, url: `/uploads/${fileName}` }
}

/**
 * Resolve a stored file reference to a public URL.
 * - On Vercel the stored key is a Blob pathname -> build the Blob URL.
 * - Locally the key is just the filename -> /uploads/<key>.
 */
export function fileUrl(key: string): string {
  if (!key) return ""
  if (isVercel) {
    const base = process.env.BLOB_URL ?? "https://*.public.blob.vercel-storage.com"
    if (key.startsWith("http")) return key
    return `${base.replace("*", "")}/${key.replace(/^\//, "")}`
  }
  return key.startsWith("/uploads/") ? key : `/uploads/${key}`
}

export async function deleteFile(key: string): Promise<void> {
  if (!key) return
  if (isVercel) {
    const { del } = await import("@vercel/blob")
    const url = key.startsWith("http") ? key : fileUrl(key)
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
    return
  }
  const fs = await import("fs")
  const path = await import("path")
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, path.basename(key)))
  } catch {
    /* ignore */
  }
}
