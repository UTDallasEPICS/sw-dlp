
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

type DatabaseType = BetterSQLite3Database<typeof schema>

interface VideoData {
  videoUrl: string
  videoTitle: string
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

    db.transaction(tx => {
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

      tx.delete(schema.chapterVideo)
        .where(
          eq(schema.chapterVideo.chapterId, savedChapter.id)
        )
        .run()

      // delete any outdata videos
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
    })

    console.log(`Seeded ${data.title}`)
  }
}
