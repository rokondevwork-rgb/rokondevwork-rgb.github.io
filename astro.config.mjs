// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, social tags, RSS and the sitemap.
  // Update this if Cloudflare assigns a different *.pages.dev name (or you add a custom domain).
  site: 'https://rokon-portfolio.pages.dev',
  // Match how Cloudflare Pages serves directory-style pages (/blog/), so dev and prod behave the same.
  trailingSlash: 'always',
});
