
import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  // retrieve the submitted information
  const body = await readBody(event)

  const updates: {
    name?: string
    email?: string
    phoneNumber?: string | null
    updatedAt?: Date
  } = {}

  if (body.name !== undefined) {
    if (
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid name',
      })
    }
    updates.name = body.name.trim()
  }

  if (body.email !== undefined) {
    if (
      typeof body.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email address',
      })
    }

    const normalizedEmail = body.email.trim().toLowerCase()

    const existingEmail = await db
      .select({ id: user.id })
      .from(user)
      .where(
        and(
          eq(user.email, normalizedEmail),
          ne(user.id, currentUser.id)
        )
      )
      .limit(1)

    if (existingEmail.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email address is already in use',
      })
    }
    updates.email = normalizedEmail
  }


  if (body.phoneNumber !== undefined) {
    if (
      body.phoneNumber !== null &&
      typeof body.phoneNumber !== 'string'
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid phone number',
      })
    }
  
    const normalizedPhone = body.phoneNumber?.trim() ?? null
  
    if (normalizedPhone !== null) {
      // Remove formatting characters
      const digits = normalizedPhone.replace(/\D/g, '')
  
      // Validate phone number
      if (!/^\d{10}$/.test(digits)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Phone number must contain exactly 10 digits',
        })
      }
  
      // Check if another user already has this phone number
      const existingPhone = await db
        .select({ id: user.id })
        .from(user)
        .where(
          and(
            eq(user.phoneNumber, digits),
            ne(user.id, currentUser.id)
          )
        )
        .limit(1)
  
      if (existingPhone.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Phone number is already in use',
        })
      }
  
      // Store digits only
      updates.phoneNumber = digits
    } else {
      updates.phoneNumber = null
    }
  }
  

  // Ensure at least one field was submitted
  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No information provided to update',
    })
  }

  updates.updatedAt = new Date()

  // update db
  const [updatedUser] = await db
    .update(user)
    .set(updates)
    .where(eq(user.id, currentUser.id))
    .returning({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      updatedAt: user.updatedAt,
    })

  // Return updated information
  if (!updatedUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  return updatedUser
})