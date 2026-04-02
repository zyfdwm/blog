import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllSlugs, getPost, formatDate } from '@/lib/posts'
import { markdownToHtml } from '@/lib/markdown'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const slugs = getAllSlugs()
  if (!slugs.includes(slug)) return {}
  const post = getPost(slug)
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://yourdomain.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: ['Zyf'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const slugs = getAllSlugs()
  if (!slugs.includes(slug)) notFound()

  const post = getPost(slug)
  const contentHtml = await markdownToHtml(post.content)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "author": {
      "@type": "Person",
      "name": "Zyf"
    },
    "url": `https://yourdomain.com/blog/${slug}`
  }

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/" className="back-link">
        ← Semua artikel
      </a>

      <article>
        <header className="article-header">
          {post.tags.length > 0 && (
            <div className="article-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}

          <h1 className="article-title">{post.title}</h1>

          {post.description && (
            <p className="article-desc">{post.description}</p>
          )}

          <div className="article-meta">
            {post.date && (
              <span>{formatDate(post.date)}</span>
            )}
            {post.date && <span className="article-meta-dot" aria-hidden />}
            <span>{post.readingTime} menit baca</span>
          </div>
        </header>

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  )
}
