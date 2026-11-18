import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

// gets current user info
export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  const [record] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      admin: user.admin,
      blocked: user.blocked,
    })
    .from(user)
    .where(eq(user.id, currentUser.id))

  if (!record) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User account not found',
    })
  }

  return record
})