// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  // Used for canonical URLs, social tags, RSS and the sitemap.
  // Hosted on GitHub Pages (user site, so no `base` path needed).
  site: "https://rokondevwork-rgb.github.io",
  trailingSlash: "always",
  markdown: {
    shikiConfig: {
      themes: { light: "github-light-default", dark: "github-dark-default" },
      // Emit light-dark() colours so code blocks follow the site theme (OS or toggle) with no extra CSS/JS.
      defaultColor: "light-dark()",
    },
  },
});
