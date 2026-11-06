
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

type DatabaseType = BetterSQLite3Database<typeof schema>

interface VideoData {
  videoUrl: string
  videoTitle: string
}

interface OptionData {
  id: string
  label: string
}

interface McqQuestion {
  id: string
  type: 'mcq'
  prompt: string
  description?: string | null
  options: OptionData[]
  correctOptionId?: string | null
}

interface ShortAnswerQuestion {
  id: string
  type: 'short_answer'
  prompt: string
}

type ActivityQuestionData = McqQuestion | ShortAnswerQuestion

interface ActivityData {
  title: string
  questions: ActivityQuestionData[]
}

function validateActivity(
  value: unknown,
  filename: string
): ActivityData {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(`Invalid activity in ${filename}`)
  }
  const data = value as Record<string, unknown>
  const questionNum = 5

  if (
    typeof data.title !== 'string' ||
    !data.title.trim()
  ) {
    throw new Error(`Missing activity title in ${filename}`)
  }
  if (
    !Array.isArray(data.questions) ||
    data.questions.length !== questionNum
  ) {
    throw new Error(
      `Activity in ${filename} must contain exactly ${questionNum} questions`
    )
  }
  const usedQuestionIds = new Set<string>()

  for (const rawQuestion of data.questions) {
    if (
      typeof rawQuestion !== 'object' ||
      rawQuestion === null ||
      Array.isArray(rawQuestion)
    ) {
      throw new Error(`Invalid question in ${filename}`)
    }
    const question = rawQuestion as Record<string, unknown>

    if (
      typeof question.id !== 'string' ||
      !question.id.trim() ||
      usedQuestionIds.has(question.id)
    ) {
      throw new Error(`Invalid or duplicate question ID in ${filename}`)
    }
    usedQuestionIds.add(question.id)

    if (
      typeof question.prompt !== 'string' ||
      !question.prompt.trim()
    ) {
      throw new Error(
        `Missing prompt for ${question.id} in ${filename}`
      )
    }

    if (question.type === 'mcq') {
      if (
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        throw new Error(
          `MCQ ${question.id} needs at least 2 options`
        )
      }
      const optionIds = new Set<string>()
      for (const rawOption of question.options) {
        if (
          typeof rawOption !== 'object' ||
          rawOption === null ||
          Array.isArray(rawOption)
        ) {
          throw new Error(`Invalid option in ${question.id}`)
        }
        const option = rawOption as Record<string, unknown>

        if (
          typeof option.id !== 'string' ||
          !option.id.trim() ||
          optionIds.has(option.id) ||
          typeof option.label !== 'string' ||
          !option.label.trim()
        ) {
          throw new Error(`Invalid or duplicate option in ${question.id}`)
        }
        optionIds.add(option.id)
      }

      if (
        question.correctOptionId != null &&
        (
          typeof question.correctOptionId !== 'string' ||
          !optionIds.has(question.correctOptionId)
        )
      ) {
        throw new Error(`Invalid correctOptionId for ${question.id}`)
      }
    } else if (question.type === 'short_answer') {
      if ( question.options != null || 
          question.correctOptionId != null ||
          question.description != null
      ) {
        throw new Error(`Short answer ${question.id} cannot have options, a correct answer, nor a description`)
      }
    } else {
      throw new Error(
        `Unknown question type for ${question.id}`
      )
    }
  }
  return data as unknown as ActivityData
}



export async function seedMarkdown(db: DatabaseType) {
  const folder = path.resolve('app/assets/Contents')

  const files = fs.readdirSync(folder)
    .filter(file => file.endsWith('.md'))

  // read and parse each md file
  for (const file of files) {
    const raw = fs.readFileSync(
      path.join(folder, file),
      'utf8'
    )
    const { data, content } = matter(raw)

    if (typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error(`Missing title in ${file}`)
    }

    const slug =
      typeof data.slug === 'string' && data.slug.trim()
        ? data.slug
        : path.basename(file, '.md')

    const videos: VideoData[] = Array.isArray(data.videos)
      ? data.videos
      : []

    for (const video of videos) {
      if (
        typeof video.videoTitle !== 'string' ||
        typeof video.videoUrl !== 'string'
      ) {
        throw new Error(`Invalid video metadata in ${file}`)
      }
    }

    // Validate activity
    const activityData =
      data.activity == null
        ? null
        : validateActivity(data.activity, file)

    db.transaction(tx => {
      // Save/update chapter text
      const [savedChapter] = tx
        .insert(schema.chapter)
        .values({
          name: data.title,
          slug,
          description:
            typeof data.description === 'string'
              ? data.description
              : null,
          content,
        })
        .onConflictDoUpdate({
          target: schema.chapter.slug,
          set: {
            name: data.title,
            description:
              typeof data.description === 'string'
                ? data.description
                : null,
            content,
          },
        })
        .returning()
        .all()

      if (!savedChapter) {
        throw new Error(`Could not save chapter: ${file}`)
      }

      // Replace chapter videos
      tx.delete(schema.chapterVideo)
        .where(
          eq(schema.chapterVideo.chapterId, savedChapter.id)
        )
        .run()

      if (videos.length > 0) {
        tx.insert(schema.chapterVideo)
          .values(
            videos.map((video, index) => ({
              chapterId: savedChapter.id,
              videoTitle: video.videoTitle,
              videoUrl: video.videoUrl,
              position: index,
            }))
          )
          .run()
      }

      
      if (!activityData) {
        return
      }
      const [savedActivity] = tx
        .insert(schema.activity)
        .values({
          chapterId: savedChapter.id,
          title: activityData.title,
        })
        .onConflictDoUpdate({
          target: schema.activity.chapterId,
          set: {
            title: activityData.title,
          },
        })
        .returning()
        .all()

      if (!savedActivity) {
        throw new Error(`Could not save activity: ${file}`)
      }

      // Save/update each question
      for (const [index, question] of
        activityData.questions.entries()) {
        const isMcq = question.type === 'mcq'

        // Check if question exists
        const [existingQuestion] = tx
          .select()
          .from(schema.activityQuestion)
          .where(
            and(
              eq(
                schema.activityQuestion.activityId,
                savedActivity.id
              ),
              eq(
                schema.activityQuestion.key,
                question.id
              )
            )
          )
          .all()

          tx.insert(schema.activityQuestion)
          .values({
            activityId: savedActivity.id,
            key: question.id,
            type: question.type,
            prompt: question.prompt,
            description:
              question.type === 'mcq' ? question.description ?? null : null,
            options:
              question.type === 'mcq' ? question.options : null,
            correctOptionId:
              question.type === 'mcq' ? question.correctOptionId ?? null : null,
            position: index,
          })
          .onConflictDoUpdate({
            target: [
              schema.activityQuestion.activityId,
              schema.activityQuestion.key,
            ],
            set: {
              type: question.type,
              prompt: question.prompt,
              description:
                question.type === 'mcq' ? question.description ?? null : null,
              options:
                question.type === 'mcq' ? question.options : null,
              correctOptionId:
                question.type === 'mcq' ? question.correctOptionId ?? null : null,
              position: index,
            },
          })
          .run()
      }
    })

    console.log(
      `Seeded ${data.title}` +
      (activityData ? ' (with activity)' : '')
    )
  }
}

