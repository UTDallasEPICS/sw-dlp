import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { requireUser } from '~~/server/utils/session'

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    phoneNumber: z.string().trim().min(7, 'Enter a valid phone number'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)
  const input = await readValidatedBody(event, updateProfileSchema.parse)

  const [phoneOwner] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.phoneNumber, input.phoneNumber), ne(user.id, currentUser.id)))
    .limit(1)

  if (phoneOwner) {
    throw createError({
      statusCode: 409,
      statusMessage: 'That phone number is already in use',
    })
  }

  const [updatedProfile] = await db
    .update(user)
    .set({
      name: input.name,
      phoneNumber: input.phoneNumber,
      updatedAt: new Date(),
    })
    .where(eq(user.id, currentUser.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })

  if (!updatedProfile) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User account not found',
    })
  }

  return updatedProfile
})
