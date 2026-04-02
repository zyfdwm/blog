import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: 'Zyf - Exploring SEO & Digital Growth',
    template: '%s - Exploring SEO & Digital Growth ·',
  },
  description: 'Talking about Digital Marketing, SEO, Paid Channel, and How Business Growth through Digital',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Zyf - Exploring SEO & Digital Growth',
    description: 'Talking about Digital Marketing, SEO, Paid Channel, and How Business Growth through Digital',
    url: 'https://yourdomain.com',
    siteName: 'Zyf Blog',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zyf - Exploring SEO & Digital Growth',
    description: 'Talking about Digital Marketing, SEO, Paid Channel, and How Business Growth through Digital',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <div className="page-wrapper">
          <header className="site-header">
            <div className="site-header__inner">
              <a href="/" className="site-logo">Zyf ·</a>
              <nav className="site-nav">
                <a href="#">About</a>
              </nav>
            </div>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <p>© {new Date().getFullYear()} Zyf · All Right Reserved</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
