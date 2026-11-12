import { db } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  chapter,
  activity,
  activityQuestion,
  userQuestionResponse,
} from '~~/server/db/schema'

// format accepted from the slue.vue
const responseSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().nullable(),
  writtenAnswers: z.array(z.string()).nullable(),
})

const submissionSchema = z.object({
  responses: z.array(responseSchema).min(1),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing chapter slug',
    })
  }

  // validate the request body
  const body = submissionSchema.safeParse(
    await readBody(event)
  )
  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid submission format',
    })
  }
  const responses = body.data.responses

  const [savedChapter] = await db
    .select({ id: chapter.id })
    .from(chapter)
    .where(eq(chapter.slug, slug))
    .all()
  if (!savedChapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    })
  }

  const [savedActivity] = await db
    .select({ id: activity.id })
    .from(activity)
    .where(eq(activity.chapterId, savedChapter.id))
    .all()
  if (!savedActivity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Activity not found',
    })
  }

  // load the valid questions
  const questions = await db
    .select()
    .from(activityQuestion)
    .where(eq(activityQuestion.activityId, savedActivity.id))
    .all()

  const questionMap = new Map(
    questions.map(q => [q.id, q])
  )
  if (responses.length !== questions.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All questions must be answered',
    })
  }

  const seenIds = new Set<string>()

  // STEP 7: Validate the actual answers
  for (const response of responses) {
    const question = questionMap.get(response.questionId)

    if (!question || seenIds.has(response.questionId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or duplicate question',
      })
    }

    seenIds.add(response.questionId)

    if (question.type === 'mcq') {
      // Drizzle normally parses JSON-mode columns.
      const options = question.options

      if (
        !Array.isArray(options) || !response.selectedOptionId || !options.some(
          option => option.id === response.selectedOptionId
        ) ||
        response.writtenAnswers !== null
      ) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid MCQ answer',
        })
      }
    } else if (question.type === 'short_answer') {
      const answers = response.writtenAnswers

      if (
        response.selectedOptionId !== null ||
        !answers || answers.length === 0 ||  !answers.every(answer => answer.trim().length > 0)
      ) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid written answer',
        })
      }
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Unknown question type',
      })
    }
  }

  // save all answers together
  db.transaction(tx => {
    for (const response of responses) {
      tx.insert(userQuestionResponse)
        .values({
          userId,
          questionId: response.questionId,
          selectedOptionId: response.selectedOptionId,
          writtenAnswers: response.writtenAnswers,
          submittedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            userQuestionResponse.userId,
            userQuestionResponse.questionId,
          ],
          set: {
            selectedOptionId: response.selectedOptionId,
            writtenAnswers: response.writtenAnswers,
            submittedAt: new Date(),
          },
        })
        .run()
    }
  })

  return {
    success: true,
    savedCount: responses.length,
  }
})
