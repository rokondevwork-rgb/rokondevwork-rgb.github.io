// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Font files come from the @fontsource packages in node_modules (latin subset only), so the build
// never depends on reaching Google Fonts and the site self-hosts every face it uses.
/** @param {string} pkg @param {string} file */
const font = (pkg, file) => `${pkg}/files/${file}`;

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  fonts: [
    {
      // Signage: level numerals, the name, section titles. Condensed, built for wayfinding.
      provider: fontProviders.local(),
      name: "Big Shoulders Display",
      cssVariable: "--font-sign",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: [font("@fontsource-variable/big-shoulders-display", "big-shoulders-display-latin-wght-normal.woff2")],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
    {
      // Voice: statements, quotes, the first-person lines.
      provider: fontProviders.local(),
      name: "Instrument Serif",
      cssVariable: "--font-serif",
      fallbacks: ["serif"],
      options: {
        variants: [
          { src: [font("@fontsource/instrument-serif", "instrument-serif-latin-400-normal.woff2")], weight: 400, style: "normal" },
          { src: [font("@fontsource/instrument-serif", "instrument-serif-latin-400-italic.woff2")], weight: 400, style: "italic" },
        ],
      },
    },
    {
      // Reading: body copy and controls.
      provider: fontProviders.local(),
      name: "Instrument Sans",
      cssVariable: "--font-body",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: [font("@fontsource-variable/instrument-sans", "instrument-sans-latin-standard-normal.woff2")],
            weight: "400 700",
            stretch: "75% 100%",
            style: "normal",
          },
          {
            src: [font("@fontsource-variable/instrument-sans", "instrument-sans-latin-standard-italic.woff2")],
            weight: "400 700",
            stretch: "75% 100%",
            style: "italic",
          },
        ],
      },
    },
    {
      // Annotation: callouts, the depth gauge, the terminal, stack labels, dates.
      provider: fontProviders.local(),
      name: "Martian Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: [font("@fontsource-variable/martian-mono", "martian-mono-latin-standard-normal.woff2")],
            weight: "100 800",
            stretch: "75% 112.5%",
            style: "normal",
          },
        ],
      },
    },
  ],
  // Used for canonical URLs, social tags and the sitemap.
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
