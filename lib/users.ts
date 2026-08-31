import { readJson, writeJson } from "@/lib/store"

export type StoredUser = {
  name?: string
  username: string
  password: string
  role: string
}

export function readUsers(): StoredUser[] {
  const data = readJsonSync("users") as { users?: StoredUser[] } | null
  return data?.users ?? []
}

function readJsonSync(key: string): unknown | null {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const fs = require("fs")
    const path = require("path")
    const filePath = path.join(process.cwd(), "lib", "users.json")
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"))
    } catch {
      return null
    }
  }
  const fs = require("fs")
  const path = require("path")
  const filePath = path.join(process.cwd(), "lib", "users.json")
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"))
  } catch {
    return null
  }
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  await writeJson("users", { users })
}
