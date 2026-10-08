import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { CourseTitles } from '../db/schema'

const sqlite = new Database('database.db')
const db = drizzle(sqlite)

interface Chapters {
  title: string
  read: boolean
}

interface Sections {
  title: string
  chapters: Chapters[]
}

const courseData: Sections[] = [
  {
    title: 'Welcome',
    chapters: [{ title: 'Overview', read: true }],
  },
  {
    title: 'Introduction',
    chapters: [
      { title: 'Introduction', read: false },
      { title: 'Sections Summary', read: false },
    ],
  },
  {
    title: 'Section 1: The Awakening: You Are Not Alone',
    chapters: [
      { title: 'Chapter 1: Espresso and You', read: false },
      { title: 'Chapter 2: You "Aha" Moment', read: false },
      { title: 'Chapter 3: Feelings Assessment', read: false },
      { title: 'Chapter 4: Coping Mechanisms', read: false },
      { title: 'Section One Summary', read: false },
    ],
  },
  {
    title: 'Section 2: Recognizing Patterns of Behavior',
    chapters: [
      { title: 'Overview', read: false },
      { title: 'Chapter 5: Reoccurring Themes', read: false },
      { title: 'Chapter 6: Your Behaviors, Set Boundaries', read: false },
      { title: 'Chapter 7: Inner Music', read: false },
      { title: 'Chapter 8: Communication Hooks, Medical Impact', read: false },
      { title: 'Section Two Summary', read: false },
    ],
  },
  {
    title: 'Section 3: Understanding Abusive Relationships',
    chapters: [
      { title: 'Overview', read: false },
      { title: 'Chapter 9: Powerless, Forgiveness, Bitterness', read: false },
      { title: 'Chapter 10: Types of Abuse, Cycles, Safety, Legal', read: false },
      { title: 'Section Three Summary', read: false },
    ],
  },
  {
    title: 'Section 4: Build Your Self-­Esteem',
    chapters: [
      { title: 'Overview', read: false },
      { title: 'Chapter 11: Self—­esteem Defined', read: false },
      { title: 'Chapter 12: Self—­esteem: What erodes? How to enhance?', read: false },
      { title: 'Section Four Summary', read: false },
    ],
  },
  {
    title: 'Section 5: Redefine Your Life',
    chapters: [
      { title: 'Overview', read: false },
      { title: 'Chapter 13: Seven Ingredients to Perfection, #1 God, #2 Body', read: false },
      { title: 'Chapter 14: Seven Ingredients of Perfection, #3 Soul, #4 Mind', read: false },
      {
        title: 'Chapter 15: Seven Ingredients, #5 Words, #6 Lessons, #7 Relationships',
        read: false,
      },
      { title: 'Section Five Summary', read: false },
    ],
  },
]

/*const Chapters: string[] = [
  'Overview',
  'Chapter 1: Espresso and You',
  'Chapter 2: You "Aha" Moment',
  'Chapter 3: Feelings Assessment',
  'Chapter 4: Coping Mechanisms',
  'Section One Summary',
  'Overview',
  'Chapter 5: Reoccurring Themes',
  'Chapter 6: Your Behaviors, Set Boundaries',
  'Chapter 7: Inner Music',
  'Chapter 8: Communication Hooks, Medical Impact',
  'Section Two Summary',
  'Overview',
  'Chapter 9: Powerless, Forgiveness, Bitterness',
  'Chapter 10: Types of Abuse, Cycles, Safety, Legal',
  'Section Three Summary',
  'Overview',
  'Chapter 11: Self—­esteem Defined',
  'Chapter 12: Self—­esteem: What erodes? How to enhance?',
  'Section Four Summary',
  'Overview',
  'Chapter 13: Seven Ingredients to Perfection, #1 God, #2 Body',
  'Chapter 14: Seven Ingredients of Perfection, #3 Soul, #4 Mind',
  'Chapter 15: Seven Ingredients, #5 Words, #6 Lessons, #7 Relationships',
  'Section Five Summary',
]

const Sections: string[] = [
  'Section 1: The Awakening: You Are Not Alone',
  'Section 2: Recognizing Patterns of Behavior',
  'Section 3: Understanding Abusive Relationships',
  'Section 4: Build Your Self-­Esteem',
  'Section 5: Redefine Your Life',
]
*/

async function seedCourses() {
  console.log('Seeding courses...')

  const CourseTitlesData = courseData.map((section) => ({
    Sections: section.title,
    Chapters: section.chapters.map((chapter) => chapter.title)
  }))
  
  await db.insert(CourseTitles).values(CourseTitlesData)

  console.log('Database seeded successfully.')
}

seedCourses().catch((error) => {
  console.error('Seeding failed:', error)
})
