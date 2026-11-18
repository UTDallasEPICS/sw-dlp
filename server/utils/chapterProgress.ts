import { and, eq } from 'drizzle-orm'
import {
  activity,
  chapter,
  chapterVideo,
  lesson,
  userLesson,
} from '../db/schema'
import { db } from '../utils/db'

const hasLessonIdColumn = (
    db.$client.prepare('PRAGMA table_info(userLesson)').all() as Array<{ name: string }>
  ).some((column) => column.name === 'lessonId')

export async function getChapterProgress(userId: string) {
    const rows = await db
        .select({
        chapterId: chapter.id,
        chapterName: chapter.name,
        lessonId: lesson.id,
        completed: userLesson.completed,
        })
        .from(chapter)
        .leftJoin(lesson, eq(lesson.chapterId, chapter.id))
        .leftJoin(
        userLesson,
        and(
            hasLessonIdColumn ? eq(userLesson.lessonId, lesson.id) : eq(userLesson.id, lesson.id),
            eq(userLesson.userId, userId)
        )
        )
        .orderBy(chapter.name)

    const stepRows = await db
        .select({
        chapterId: chapter.id,
        videoId: chapterVideo.id,
        activityId: activity.id,
        lessonName: lesson.name,
        lessonCompleted: userLesson.completed,
        })
        .from(chapter)
        .leftJoin(chapterVideo, eq(chapterVideo.chapterId, chapter.id))
        .leftJoin(activity, eq(activity.chapterId, chapter.id))
        .leftJoin(
        lesson,
        eq(lesson.chapterId, chapter.id)
        )
        .leftJoin(
        userLesson,
        and(
            eq(userLesson.lessonId, lesson.id),
            eq(userLesson.userId, userId))
        )

  const chapters = new Map<
    string,
    {
      id: string
      name: string
      lessonCount: number
      completedLessonCount: number
      completedStepIds: Set<string>
      videoIds: Set<string>
      hasActivity: boolean
      readingPageCount: number
    }
  >()

  for (const row of rows) {
    let progress = chapters.get(row.chapterId)

    if (!progress) {
      progress = {
        id: row.chapterId,
        name: row.chapterName,
        lessonCount: 0,
        completedLessonCount: 0,
        completedStepIds: new Set(),
        videoIds: new Set(),
        hasActivity: false,
        readingPageCount: 1,
      }
      chapters.set(row.chapterId, progress)
    }

    if (row.lessonId) {
      progress.lessonCount += 1
      if (row.completed) {
        progress.completedLessonCount += 1
      }
    }
  }

  for (const row of stepRows) {
    const progress = chapters.get(row.chapterId)
    if (!progress) continue
    if (row.videoId) progress.videoIds.add(row.videoId)
    if (row.activityId) progress.hasActivity = true
    if (row.lessonCompleted && row.lessonName) {
      progress.completedStepIds.add(row.lessonName)
    }
  }

  const chapterRows = await db
    .select({ id: chapter.id, content: chapter.content })
    .from(chapter)
  for (const row of chapterRows) {
    const progress = chapters.get(row.id)
    if (progress) {
      progress.readingPageCount = Math.max(1, (row.content.match(/<-{2,}\s*next\s*-{2,}>/gi) ?? []).length + 1)
    }
  }

  const chapterProgress = Array.from(chapters.values(), (progress) => {
    const lessonCompleted =
      progress.lessonCount > 0 &&
      progress.completedLessonCount === progress.lessonCount
    const stepIds = [
      ...(progress.videoIds.size > 0 ? ['video'] : []),
      ...Array.from({ length: progress.readingPageCount }, (_, index) => `reading-${index + 1}`),
      ...(progress.hasActivity ? ['activity'] : []),
    ]
    const completedSteps = stepIds.filter((stepId) => progress.completedStepIds.has(stepId))
    const chapterCompleted = stepIds.length > 0 && completedSteps.length === stepIds.length
    return {
      id: progress.id,
      name: progress.name,
      completed: chapterCompleted || (progress.lessonCount > 0 && lessonCompleted && stepIds.length === 0),
      lessonCount: progress.lessonCount,
      completedLessonCount: progress.completedLessonCount,
    }
  })
  
    return { chapters: chapterProgress }
  }