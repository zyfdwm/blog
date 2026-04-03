import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client } from '@notionhq/client'
import { notion, databaseId } from '@/lib/notion'
import NotionBlocks from '@/components/NotionBlocks'

const notionClient = notion as Client

type Props = {
  params: Promise<{
    slug: string
  }>
}

async function getPostBySlug(slug: string) {
  const res: any = await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Slug',
          rich_text: {
            equals: slug,
          },
        },
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
      ],
    },
  })

  return res.results?.[0] || null
}

async function getBlockChildrenRecursively(blockId: string): Promise<any[]> {
  let allBlocks: any[] = []
  let cursor: string | undefined = undefined

  do {
    const response: any = await notionClient.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })

    const blocks = response.results || []

    for (const block of blocks) {
      if (block.has_children) {
        block.children = await getBlockChildrenRecursively(block.id)
      }
    }

    allBlocks = [...allBlocks, ...blocks]
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return allBlocks
}

function getPlainTextFromTitle(post: any) {
  return post.properties.Title?.title?.[0]?.plain_text || ''
}

function getPlainTextFromDescription(post: any) {
  return post.properties.Description?.rich_text?.[0]?.plain_text || ''
}

function getDate(post: any) {
  return post.properties.Date?.date?.start || ''
}

function getTags(post: any) {
  return post.properties.Tags?.multi_select?.map((tag: any) => tag.name) || []
}

function getSlug(post: any) {
  return post.properties.Slug?.rich_text?.[0]?.plain_text || ''
}

export async function generateStaticParams() {
  const res: any = await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
    page_size: 100,
  })

  return (res.results as any[])
    .map((post) => ({
      slug: getSlug(post),
    }))
    .filter((item) => item.slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return {}

  const title = getPlainTextFromTitle(post)
  const description = getPlainTextFromDescription(post)
  const date = getDate(post)
  const tags = getTags(post)

  return {
    title,
    description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://zyfspace.pages.dev/${slug}`,
      type: 'article',
      publishedTime: date,
      authors: ['Zyf'],
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const blocks = await getBlockChildrenRecursively(post.id)

  const title = getPlainTextFromTitle(post)
  const description = getPlainTextFromDescription(post)
  const date = getDate(post)
  const tags = getTags(post)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    author: {
      '@type': 'Person',
      name: 'Zyf',
    },
    url: `https://zyfspace.pages.dev/${slug}`,
    keywords: tags.join(', '),
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
          {tags.length > 0 && (
            <div className="article-tags">
              {tags.map((tag: string) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="article-title">{title}</h1>

          {description && (
            <p className="article-desc">
              {description}
            </p>
          )}

          <div className="article-meta">
            {date && <span>{date}</span>}
            {date && (
              <span className="article-meta-dot" aria-hidden>
                •
              </span>
            )}
            <span>5 menit baca</span>
          </div>
        </header>

        <div className="article-content">
          <NotionBlocks blocks={blocks} />
        </div>
      </article>
    </div>
  )
}