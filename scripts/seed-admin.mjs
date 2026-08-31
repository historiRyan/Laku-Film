#!/usr/bin/env node
/**
 * Seed admin user into Upstash Redis (for Vercel deploy).
 *
 * Usage (local):
 *   1. Set env vars (from Upstash dashboard):
 *      export UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *      export UPSTASH_REDIS_REST_TOKEN=xxxxx
 *   2. Optional override:
 *      export SEED_ADMIN_USER=admin
 *      export SEED_ADMIN_PASS=admin
 *   3. Run:
 *      node scripts/seed-admin.mjs
 *
 * This writes the `users` key in Redis with a single admin account
 * using the same scrypt hash format as lib/password.ts.
 */
import { Redis } from "@upstash/redis"
import {
  randomBytes,
  scrypt as _scrypt,
  timingSafeEqual,
} from "crypto"
import { promisify } from "util"

const scrypt = promisify(_scrypt)

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const derived = (await scrypt(password, salt, 64)).toString("hex")
  return `${salt}:${derived}`
}

async function main() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.error(
      "ERROR: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (from Upstash dashboard).",
    )
    process.exit(1)
  }

  const username = process.env.SEED_ADMIN_USER || "admin"
  const password = process.env.SEED_ADMIN_PASS || "admin"
  const hash = await hashPassword(password)

  const redis = new Redis({ url, token })
  const users = [{ name: username, username, password: hash, role: "admin" }]
  await redis.set("users", { users })
  console.log(`✅ Admin '${username}' seeded to Upstash Redis.`)
  console.log(`   Login at /login with username '${username}' and your password.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
