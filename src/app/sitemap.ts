import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = '/'
  const posts = getAllPosts()

  return [
    { url: baseUrl, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${baseUrl}/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
    })),
  ]
}