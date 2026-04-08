import { notion, databaseId } from "@/lib/notion";
import { Client } from "@notionhq/client";

const notionClient = notion as Client;

async function getBlockChildrenRecursively(blockId: string): Promise<any[]> {
  let allBlocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notionClient.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    const blocks = response.results || [];

    for (const block of blocks) {
      if (block.has_children) {
        block.children = await getBlockChildrenRecursively(block.id);
      }
    }

    allBlocks = [...allBlocks, ...blocks];
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return allBlocks;
}

function extractPlainTextFromBlocks(blocks: any[]): string {
  let text = "";

  for (const block of blocks) {
    const blockType = block.type;
    const value = block[blockType];

    if (value?.rich_text) {
      text +=
        " " +
        value.rich_text.map((item: any) => item.plain_text || "").join(" ");
    }

    if (block.children?.length) {
      text += " " + extractPlainTextFromBlocks(block.children);
    }
  }

  return text.trim();
}

function calculateReadingTime(blocks: any[]): number {
  const text = extractPlainTextFromBlocks(blocks);
  const words = text.split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;

  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
function formatDate(dateString: string) {
  if (!dateString) return ''

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
export default async function HomePage() {
  const res = await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  const posts = await Promise.all(
    (res.results as any[]).map(async (post) => {
      const props = post.properties;

      const coverUrl = props.CoverUrl?.url || "";
      const coverFile = props.Cover?.files?.[0];

      const cover =
        coverUrl ||
        (coverFile?.type === "external" ? coverFile.external?.url || "" : "");

      const blocks = await getBlockChildrenRecursively(post.id);
      const readingTime = calculateReadingTime(blocks);

      return {
        id: post.id,
        title: props.Title?.title?.[0]?.plain_text || "No title",
        slug: props.Slug?.rich_text?.[0]?.plain_text || "",
        date: props.Date?.date?.start || "",
        description: props.Description?.rich_text?.[0]?.plain_text || "",
        tags:
          props.Tags?.multi_select?.map((tag: any) => ({
            name: tag.name,
            color: tag.color,
          })) || [],
        readingTime,
        cover,
      };
    })
  );

  return (
    <div className="container">
      <div className="home-hero">
        <h1 className="home-hero__title">
          Talking about SEO, Tech, Digital Marketing, and How Business Growth Better.
        </h1>
        <p className="home-hero__desc">
          Digital Marketing Enthusiast yang senang dengan banyak hal.
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Zyf - Exploring SEO & Digital Growth",
            url: "https://zyfspace.pages.dev",
            description:
              "Zyf Space is an Personal blog That Talking about SEO, Tech, Digital Marketing, and How Business Growth Better through Digital Marketing",
            author: {
              "@type": "Person",
              name: "Zyf",
            },
          }),
        }}
      />

      <div className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada artikel. Yuk nulis yang pertama!</p>
          </div>
        ) : (
          posts.map((post) => (
            <a key={post.id} href={`/${post.slug}`} className="post-card">
              <div className="post-card__layout">
                <div className="post-card__meta">
                  {post.date && (
                    <span className="post-card__date">{formatDate(post.date)}</span>
                  )}
                  {post.date && (
                    <span className="post-card__meta-dot" style={{ color: 'var(--text-muted)' }} aria-hidden>
                      /
                    </span>
                  )}
                  <span className="post-card__reading-time">
                    {post.readingTime} Min Reads
                  </span>
                </div>

                <h2 className="post-card__title">{post.title}</h2>

                {post.tags.length > 0 && (
                  <div className="post-card__tags">
                    {post.tags.map((tag: { name: string; color: string }) => (
                      <span
                        key={tag.name}
                        className={`tag notion-tag notion-tag--${tag.color || 'default'}`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {post.description && (
                  <p className="post-card__desc">{post.description}</p>
                )}

                <div className="post-card__thumb">
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="post-card__thumb-img"
                    />
                  ) : (
                    <div className="post-card__thumb-placeholder" />
                  )}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}