import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { prayerRequest, user } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

const requestSchema = z.object({
  request: z.string().trim().min(1, 'Prayer request is required'),
})

// create/replace users own prayer request
export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  const [account] = await db
  .select({ admin: user.admin })
  .from(user)
  .where(eq(user.id, currentUser.id))

  if (account?.admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admins cannot submit prayer requests',
    })
  }
  
  const body = await readValidatedBody(
    event,
    requestSchema.parse
  )

  const [createdRequest] = await db
    .insert(prayerRequest)
    .values({
      userId: currentUser.id,
      request: body.request,
    })
    .returning({
      id: prayerRequest.id,
      request: prayerRequest.request,
      submittedAt: prayerRequest.submittedAt,
    })

  setResponseStatus(event, 201)

  return createdRequest
})