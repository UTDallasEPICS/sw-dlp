import { eq, or } from 'drizzle-orm'
import { z } from 'zod'
import { user } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
  phoneNumber: z.string().trim().min(7, 'Invalid phone number'),
})

export default defineEventHandler(async (event) => {
  const input = signupSchema.parse(await readBody(event))

  const existingUser = await db.query.user.findFirst({
    where: (userTable) =>
      or(eq(userTable.email, input.email), eq(userTable.phoneNumber, input.phoneNumber)),
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage:
        existingUser.email === input.email
          ? 'An account with that email already exists'
          : 'That phone number is already in use',
    })
  }

  const [createdUser] = await db
    .insert(user)
    .values({
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
    })
    .returning({ id: user.id })

  return createdUser
})
