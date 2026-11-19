import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { adminNote, user } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

const bodySchema = z.object({
  userId: z.string().min(1),
  note: z.string().trim().min(1, 'Note is required').max(5000),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  // set by the server middleware for every signed-in request
  const authorId = event.context.user?.id ?? null

  const body = await readValidatedBody(event, bodySchema.parse)

  const target = await db.select({ id: user.id }).from(user).where(eq(user.id, body.userId)).get()

  if (!target) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // same timestamp for both, so the page can tell whether a note was edited later
  const now = new Date()

  const [created] = await db
    .insert(adminNote)
    .values({
      userId: body.userId,
      authorId,
      note: body.note,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: adminNote.id,
      note: adminNote.note,
      createdAt: adminNote.createdAt,
      updatedAt: adminNote.updatedAt,
    })

  setResponseStatus(event, 201)

  return created
})