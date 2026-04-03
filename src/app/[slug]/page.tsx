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

function getCover(post: any) {
  const coverUrl = post.properties.CoverUrl?.url || ''
  const coverFile = post.properties.Cover?.files?.[0]

  return (
    coverUrl ||
    (coverFile?.type === 'external'
      ? coverFile.external?.url || ''
      : '')
  )
}

function extractPlainTextFromBlocks(blocks: any[]): string {
  let text = ''

  for (const block of blocks) {
    const blockType = block.type
    const value = block[blockType]

    if (value?.rich_text) {
      text +=
        ' ' +
        value.rich_text.map((item: any) => item.plain_text || '').join(' ')
    }

    if (block.children?.length) {
      text += ' ' + extractPlainTextFromBlocks(block.children)
    }
  }

  return text.trim()
}

function calculateReadingTime(blocks: any[]): number {
  const text = extractPlainTextFromBlocks(blocks)
  const words = text.split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 200

  return Math.max(1, Math.ceil(words / wordsPerMinute))
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
  const cover = getCover(post)

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
      images: cover
        ? [
          {
            url: cover,
            width: 1200,
            height: 630,
            alt: title,
          },
        ]
        : [],
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      images: cover ? [cover] : [],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const blocks = await getBlockChildrenRecursively(post.id)
  const readingTime = calculateReadingTime(blocks)
  const title = getPlainTextFromTitle(post)
  const description = getPlainTextFromDescription(post)
  const date = getDate(post)
  const tags = getTags(post)
  const cover = getCover(post)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    image: cover || undefined,
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
            <span>{readingTime} menit baca</span>
          </div>
        </header>

        <div className="article-content">
          <NotionBlocks blocks={blocks} />
        </div>
      </article>
    </div>
  )
}