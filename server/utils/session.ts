import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'

// Returns the session user attached by the auth gateway (server/middleware/auth.ts).
// Throws 401 if it is absent, so protected routes get a typed, non-null user
// instead of asserting event.context.user! and trusting the middleware ran.
export function requireUser(event: H3Event) {
  const user = event.context.user

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  return user
}

// determines if current user is admin
export async function requireAdmin(event: H3Event) {
  const currentUser = requireUser(event)

  const [record] = await db
    .select({
      id: user.id,
      admin: user.admin,
      blocked: user.blocked,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))

  if (!record?.admin || record.blocked) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return record
}