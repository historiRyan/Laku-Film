import crypto from "crypto"

const scrypt = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derived) => {
      if (err) reject(err)
      else resolve(derived)
    })
  })

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex")
  const bb = Buffer.from(b, "hex")
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex")
  const derived = await scrypt(password, salt)
  return `${salt}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const derived = await scrypt(password, salt)
  return timingSafeEqual(derived.toString("hex"), hash)
}
