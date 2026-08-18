import 'server-only'
import { cookies } from 'next/headers'
import { verifyJwt, COOKIE_NAME } from '@/lib/jwt'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return await verifyJwt(token)
}
