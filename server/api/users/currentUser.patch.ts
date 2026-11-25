
import { and, eq, ne } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  // Retrieve the submitted information
  const body = await readBody(event)

  // Store only the fields that need to be updated
  const updates: {
    name?: string
    phoneNumber?: string | null
    updatedAt?: Date
  } = {}

  // Validate and update name
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

  // Validate and update phone number
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
      let digits = normalizedPhone.replace(/\D/g, '')

      // Remove the US country code if it was provided
      if (digits.length === 11 && digits.startsWith('1')) {
        digits = digits.slice(1)
      }

      // Validate that the number contains exactly 10 digits
      if (!/^\d{10}$/.test(digits)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Phone number must contain 10 digits',
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
          statusMessage: 'Phone number is already in use, please enter another number',
        })
      }

      // Store the normalized 10-digit number
      updates.phoneNumber = digits
    } else {
      // Allow the user to remove their phone number
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

  // Update database
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
