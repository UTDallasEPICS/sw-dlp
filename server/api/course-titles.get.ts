import { sql } from 'drizzle-orm'
import { chapter, CourseTitles } from '../db/schema'
import { db } from '../utils/db'
import { requireUser } from '../utils/session'

export default defineEventHandler(async (event) => {
  requireUser(event)

  const sections = await db
    .select({
      id: CourseTitles.id,
      title: CourseTitles.Sections,
      chapters: CourseTitles.Chapters,
    })
    .from(CourseTitles)
    .orderBy(sql`${CourseTitles}.rowid`)

  const chapters = await db
    .select({ id: chapter.id, name: chapter.name, slug: chapter.slug })
    .from(chapter)
  const normalize = (value: string) =>
    value
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, '')

  return sections.map((section) => ({
    ...section,
    chapters: section.chapters.map((title) => {
      const sectionNumber = /^section\s+(\d+)/i.exec(section.title)?.[1]
      const chapterNumber = /^chapter\s+(\d+)\b/i.exec(title)?.[1]
      let expectedSlug = title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '')
      if (chapterNumber) expectedSlug = `chapter-${chapterNumber}`
      else if (sectionNumber && title === 'Overview')
        expectedSlug = `section-${sectionNumber}-overview`
      else if (sectionNumber && /summary$/i.test(title))
        expectedSlug = `section-${sectionNumber}-summary`
      else if (section.title === 'Welcome' && title === 'Overview') expectedSlug = 'welcome'

      const match =
        chapters.find((entry) => normalize(entry.slug) === normalize(expectedSlug)) ??
        chapters.find((entry) => normalize(entry.name) === normalize(title))

      return {
        id: match?.id ?? null,
        title,
        slug: match ? match.slug.replaceAll('_', '-').toLowerCase() : null,
      }
    }),
  }))
})
