import { desc, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { adminNote } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

// admin only: all private notes for one user, newest first
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, 'userId')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user ID',
    })
  }

  return await db
    .select({
      id: adminNote.id,
      note: adminNote.note,
      createdAt: adminNote.createdAt,
      updatedAt: adminNote.updatedAt,
    })
    .from(adminNote)
    .where(eq(adminNote.userId, userId))
    .orderBy(desc(adminNote.createdAt))
})