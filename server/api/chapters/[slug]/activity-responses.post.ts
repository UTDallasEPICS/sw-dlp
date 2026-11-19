import { db } from '../../../utils/db'
import { and, eq } from 'drizzle-orm'
import { queryCollection } from '@nuxt/content/nitro'
import { z } from 'zod'
import { chapterSlugFromPath, scrolledReadingStep, splitReadingPages } from '#shared/utils/readingPages'
import {
  chapter,
  activity,
  activityQuestion,
  lesson,
  userLesson,
  userQuestionResponse,
} from '~~/server/db/schema'

// format accepted from the slue.vue
const responseSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().nullable(),
  writtenAnswers: z.array(z.string()).nullable(),
})

const submissionSchema = z.object({
  mode: z.enum(['autosave', 'submit']).default('submit'),
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
  const { mode, responses } = body.data

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

  if (mode === 'submit') {
    const chapters = await queryCollection(event, 'chapters').select('path', 'body').all()
    const content = chapters.find((entry) => chapterSlugFromPath(entry.path) === slug)
    if (!content) {
      throw createError({ statusCode: 404, statusMessage: 'Chapter reading content not found' })
    }

    const completed = await db
      .select({ stepId: lesson.name })
      .from(lesson)
      .innerJoin(userLesson, and(
        eq(userLesson.lessonId, lesson.id),
        eq(userLesson.userId, userId),
        eq(userLesson.completed, true),
      ))
      .where(eq(lesson.chapterId, savedChapter.id))
    const completedSteps = new Set(completed.map(({ stepId }) => stepId))
    const readingsComplete = splitReadingPages(content.body).every((_, index) =>
      completedSteps.has(scrolledReadingStep(`reading-${index + 1}`))
    )
    if (!readingsComplete) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Complete all reading pages before submitting this activity',
      })
    }
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
  if (mode === 'submit' && responses.length !== questions.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All questions must be answered',
    })
  }

  const seenIds = new Set<string>()
  const validResponses: typeof responses = []

  // STEP 7: Validate the actual answers
  for (const response of responses) {
    const question = questionMap.get(response.questionId)

    if (!question || seenIds.has(response.questionId)) {
      if (mode === 'submit') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid or duplicate question',
        })
      }
      continue
    }
    seenIds.add(response.questionId)

    if (question.type === 'mcq') {
      const options = question.options
      const ok =
        Array.isArray(options) &&
        response.selectedOptionId != null &&
        options.some((option) => option.id === response.selectedOptionId) &&
        response.writtenAnswers === null

      if (!ok) {
        if (mode === 'submit') {
          throw createError({ statusCode: 400, statusMessage: 'Invalid MCQ answer' })
        }
        continue // autosave: skip incomplete MCQ
      }
      validResponses.push(response)
    } else if (question.type === 'short_answer') {
      const answers = response.writtenAnswers
      const ok =
        response.selectedOptionId === null &&
        Array.isArray(answers) &&
        answers.length > 0 &&
        answers.every((answer) => answer.trim().length > 0)

      if (!ok) {
        if (mode === 'submit') {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid written answer',
          })
        }
        continue // autosave: skip empty short answers
      }
      validResponses.push({
        ...response,
        writtenAnswers: answers!.map((a) => a.trim()),
      })
    }
  }

  if (validResponses.length === 0) {
    return { success: true, savedCount: 0, mode }
  }

  // save all answers together
  db.transaction(tx => {
    for (const response of validResponses) {
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
    savedCount: validResponses.length,
    mode,
  }
})
