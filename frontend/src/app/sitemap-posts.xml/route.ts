import { absoluteUrl } from '@/lib/urls';
import { isIndexable } from '@/lib/seo/indexability';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const revalidate = 300;

interface SitemapPost {
  slug: string;
  lastmod?: string | null;
  robots?: string | null;
}

export async function GET() {
  const apiBase = process.env.INTERNAL_API_URL || 'http://backend:8000/api';
  let posts: SitemapPost[] = [];

  try {
    const res = await fetch(`${apiBase}/posts/sitemap`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json() as { posts?: SitemapPost[] };
      posts = (data.posts || []).filter((p) => isIndexable(p.robots));
    }
  } catch { /* sitemap generation must not crash */ }

  const urls = posts.map(p => {
    const date = p.lastmod ? new Date(p.lastmod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${escapeXml(absoluteUrl(p.slug))}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
