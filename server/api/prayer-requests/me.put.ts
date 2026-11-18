import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~~/server/utils/db'
import { prayerRequest } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

const requestSchema = z.object({
  request: z.string().trim().min(1, 'Prayer request is required'),
})

// create/replace users own prayer request
export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)
  const input = requestSchema.parse(await readBody(event))

  const [record] = await db
    .insert(prayerRequest)
    .values({
      userId: currentUser.id,
      request: input.request,
      submittedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: prayerRequest.userId,
      set: {
        request: input.request,
        submittedAt: new Date(),
      },
    })
    .returning({
      id: prayerRequest.id,
      request: prayerRequest.request,
      submittedAt: prayerRequest.submittedAt,
    })

  return record
})