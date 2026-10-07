// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  // Downloaded from Google Fonts at build time and self-hosted with the site (latin subset only).
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Instrument Serif",
      cssVariable: "--font-display",
      weights: [400],
      styles: ["normal", "italic"],
      fallbacks: ["serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Sans",
      cssVariable: "--font-body",
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-mono",
      weights: [400, 500],
      styles: ["normal"],
      fallbacks: ["monospace"],
    },
  ],
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
