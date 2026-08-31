import { readJson, writeJson } from "@/lib/store"

export type Comment = {
  id: string
  username: string
  text: string
  rating?: number
  createdAt: number
}

export function getCommentsKey(filmId: string): string {
  return `comments:${filmId}`
}

export async function getComments(filmId: string): Promise<Comment[]> {
  const data = (await readJson(getCommentsKey(filmId))) as Comment[] | null
  return Array.isArray(data) ? data : []
}

export async function addComment(filmId: string, comment: Comment): Promise<Comment[]> {
  const list = await getComments(filmId)
  list.unshift(comment)
  await writeJson(getCommentsKey(filmId), list)
  return list
}
