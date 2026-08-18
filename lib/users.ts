import 'server-only'
import fs from 'fs'
import path from 'path'

const USERS_PATH = path.join(process.cwd(), 'lib', 'users.json')

export interface StoredUser {
  username: string
  password: string
  role: string
  name: string
}

export interface UsersFile {
  users: StoredUser[]
}

export function readUsers(): StoredUser[] {
  try {
    const raw = fs.readFileSync(USERS_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.users) ? (parsed.users as StoredUser[]) : []
  } catch {
    return []
  }
}

export function writeUsers(users: StoredUser[]) {
  const dir = path.dirname(USERS_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(USERS_PATH, JSON.stringify({ users }, null, 2))
}
