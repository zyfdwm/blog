import { notion, databaseId } from "@/lib/notion";
import { Client } from "@notionhq/client";

const notionClient = notion as Client;

export default async function HomePage() {
  const res = await (notion as any).databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
  });

  const posts = (res.results as any[]).map((post) => {
    const props = post.properties;

    return {
      id: post.id,
      title: props.Title?.title?.[0]?.plain_text || "No title",
      slug: props.Slug?.rich_text?.[0]?.plain_text || "",
      date: props.Date?.date?.start || "",
      description:
        props.Description?.rich_text?.[0]?.plain_text || "",
      tags: props.Tags?.multi_select?.map((tag: any) => tag.name) || [],
      readingTime: 5,
    };
  });

  return (
    <div className="container">
      <div className="home-hero">
        <h1 className="home-hero__title">
          Talking about SEO, Digital Marketing, and How Business Growth Better.
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
              "Talking about Digital Marketing, SEO, Paid Channel, and How Business Growth through Digital",
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
              <div className="post-card__meta">
                {post.date && (
                  <span className="post-card__date">{post.date}</span>
                )}
                {post.date && (
                  <span className="post-card__meta-dot" aria-hidden />
                )}
                <span className="post-card__reading-time">
                  {post.readingTime} menit baca
                </span>
              </div>

              <h2 className="post-card__title">{post.title}</h2>

              {post.description && (
                <p className="post-card__desc">{post.description}</p>
              )}

              {post.tags.length > 0 && (
                <div className="post-card__tags">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))
        )}
      </div>
    </div>
  );
}