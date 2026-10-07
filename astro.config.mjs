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
      name: "Bricolage Grotesque",
      cssVariable: "--font-display",
      weights: [500, 700],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
      // Optical size axis: the browser picks tighter letterforms at large sizes.
      options: { experimental: { variableAxis: { opsz: [["12", "96"]] } } },
    },
    {
      provider: fontProviders.google(),
      name: "Geist",
      cssVariable: "--font-body",
      weights: [400, 500, 600],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: [400],
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
