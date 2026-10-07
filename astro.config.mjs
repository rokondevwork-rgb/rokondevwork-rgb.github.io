// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  // Used for canonical URLs, social tags, RSS and the sitemap.
  // Update this if Cloudflare assigns a different *.pages.dev name (or you add a custom domain).
  site: 'https://rokon-portfolio.pages.dev',
  // Match how Cloudflare Pages serves directory-style pages (/blog/), so dev and prod behave the same.
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
      // Emit light-dark() colours so code blocks follow the site theme (OS or toggle) with no extra CSS/JS.
      defaultColor: 'light-dark()',
    },
  },
});
