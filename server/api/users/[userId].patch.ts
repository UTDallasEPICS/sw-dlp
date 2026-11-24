import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user, session as sessionTable} from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

const updateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['verified', 'non-verified', 'blocked']).optional(),
}).strict().refine(
  data => data.role !== undefined || data.status !== undefined,
  { message: 'Provide a role or status to update' }
)

// Admin can updater a user's role & status
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const adminId = admin.id

  const userId = getRouterParam(event, 'userId')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user ID',
    })
  }

  const input = await readValidatedBody(
    event,
    updateUserSchema.parse
  )

  if (userId === adminId && (input.status === 'blocked' || input.role === 'user')){
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot block or demote your own account'
    })
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  })

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const updates: Partial<typeof user.$inferInsert> = {}

  if (input.role !== undefined) {
    updates.admin = input.role === 'admin'
  }

  if (input.status !== undefined) {
    updates.blocked = input.status === 'blocked'

    // Preserve verification status when blocking a user.
    if (input.status !== 'blocked') {
      updates.emailVerified = input.status === 'verified'
    }
  }

  const [updatedUser] = await db
    .update(user)
    .set(updates)
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      name: user.name,
      admin: user.admin,
      blocked: user.blocked,
      emailVerified: user.emailVerified,
    })

    if (input.status === 'blocked'){
      await db.delete(sessionTable).where(eq(sessionTable.userId, userId))
    }

  return updatedUser
})