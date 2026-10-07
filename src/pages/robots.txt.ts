// Generated from the `site` config so the sitemap URL is never out of date.
export function GET() {
  const sitemap = new URL("sitemap-index.xml", import.meta.env.SITE);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
