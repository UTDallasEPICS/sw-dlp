import { z } from 'zod'
import { eq, or } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

const addUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().min(1),
  role: z.enum(['admin', 'user']),
  status: z.enum(['verified', 'non-verified', 'blocked']),
})

// admin can add user
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const input = await readValidatedBody(
    event,
    addUserSchema.parse
  )

  const email = input.email.toLowerCase()
  const phoneNumber = input.phoneNumber.replace(/\D/g, '')

  if (phoneNumber.length !== 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone number must contain 10 digits',
    })
  }

  // Check for existing accounts
  const existingUser = await db.query.user.findFirst({
    where: (userTable) =>
      or(
        eq(userTable.email, email),
        eq(userTable.phoneNumber, phoneNumber)
      ),
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage:
        existingUser.email === email
          ? 'An account with this email already exists'
          : 'This phone number is already in use',
    })
  }

  // Insert into the database
  const [createdUser] = await db
    .insert(user)
    .values({
      name: input.name,
      email,
      phoneNumber,
      admin: input.role === 'admin',
      emailVerified: input.status === 'verified',
      blocked: input.status === 'blocked',
    })
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
    })

  setResponseStatus(event, 201)

  return createdUser
})