import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Client } from '@notionhq/client'
import { notion, databaseId } from '@/lib/notion'
import NotionBlocks from '@/components/NotionBlocks'

const notionClient = notion as Client

type Props = {
  params: {
    slug: string
  }
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

async function getAllBlocks(blockId: string) {
  let allBlocks: any[] = []
  let cursor: string | undefined = undefined

  do {
    const response: any = await notionClient.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })

    allBlocks = [...allBlocks, ...response.results]
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return allBlocks
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
  })

  return (res.results as any[])
    .map((post) => ({
      slug: post.properties.Slug?.rich_text?.[0]?.plain_text || '',
    }))
    .filter((item) => item.slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}

  const props = post.properties

  const title = props.Title?.title?.[0]?.plain_text || ''
  const description = props.Description?.rich_text?.[0]?.plain_text || ''
  const date = props.Date?.date?.start || ''
  const tags = props.Tags?.multi_select?.map((t: any) => t.name) || []

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://zyfspace.pages.dev/blog/${params.slug}`,
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
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const blocks = await getAllBlocks(post.id)

  const props = post.properties

  const title = props.Title?.title?.[0]?.plain_text || ''
  const description = props.Description?.rich_text?.[0]?.plain_text || ''
  const date = props.Date?.date?.start || ''
  const tags = props.Tags?.multi_select?.map((t: any) => t.name) || []

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
    url: `https://zyfspace.pages.dev/blog/${params.slug}`,
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

          {description && <p className="article-desc">{description}</p>}

          <div className="article-meta">
            {date && <span>{date}</span>}
            {date && <span className="article-meta-dot" aria-hidden />}
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