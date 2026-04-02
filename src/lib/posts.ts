import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content/posts')

export type PostMeta = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  readingTime: number
}

export type Post = PostMeta & { content: string }

function calcReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(raw: string): string {
  if (!raw) return ''
  const d = new Date(raw)
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return []

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const filePath = path.join(postsDir, file)
      const raw = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(raw)
      const stats = fs.statSync(filePath)
      
      return {
        slug,
        title: data.title ?? 'Untitled',
        date: data.date ? String(data.date).slice(0, 10) : '',
        description: data.description ?? '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: calcReadingTime(content),
        birthtime: stats.birthtimeMs,
      } as PostMeta & { birthtime: number }
    })
    .sort((a, b) => {
      if (a.date < b.date) return 1
      if (a.date > b.date) return -1
      return b.birthtime - a.birthtime
    })
}

export function getPost(slug: string): Post {
  const filePath = path.join(postsDir, `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title ?? 'Untitled',
    date: data.date ? String(data.date).slice(0, 10) : '',
    description: data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: calcReadingTime(content),
    content,
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDir)) return []
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

export { formatDate }
