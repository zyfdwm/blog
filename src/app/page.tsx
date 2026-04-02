import { getAllPosts, formatDate } from '@/lib/posts'

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <div className="container">
      {/* Hero */}
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
            "name": "Zyf - Exploring SEO & Digital Growth",
            "url": "https://zyfspace.pages.dev",
            "description": "Talking about Digital Marketing, SEO, Paid Channel, and How Business Growth through Digital",
            "author": {
              "@type": "Person",
              "name": "Zyf"
            }
          })
        }}
      />

      {/* Post list */}
      <div className="post-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada artikel. Yuk nulis yang pertama!</p>
          </div>
        ) : (
          posts.map((post) => (
            <a key={post.slug} href={`/${post.slug}`} className="post-card">
              <div className="post-card__meta">
                {post.date && (
                  <span className="post-card__date">{formatDate(post.date)}</span>
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
                  {post.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </a>
          ))
        )}
      </div>
    </div>
  )
}
