import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { adminNote } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

const bodySchema = z.object({
  note: z.string().trim().min(1, 'Note is required').max(5000),
})

// admin only can edit the text of an existing private note
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const noteId = getRouterParam(event, 'noteId')

  if (!noteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing note ID',
    })
  }

  const body = await readValidatedBody(event, bodySchema.parse)

  const [updated] = await db
    .update(adminNote)
    .set({ note: body.note, updatedAt: new Date() })
    .where(eq(adminNote.id, noteId))
    .returning({
      id: adminNote.id,
      note: adminNote.note,
      createdAt: adminNote.createdAt,
      updatedAt: adminNote.updatedAt,
    })

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Note not found',
    })
  }

  return updated
})