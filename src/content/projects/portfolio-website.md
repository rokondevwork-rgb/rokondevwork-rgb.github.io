---
title: "Portfolio Website"
summary: "This site: a fast, static developer portfolio built with Astro, with case studies, a blog, and an AI news page that updates itself."
stack: ["Astro", "TypeScript", "CSS", "Markdown", "Python", "GitHub Actions", "GitHub Pages"]
role: "Design and development"
link: "https://rokondevwork-rgb.github.io/"
order: 8
results:
  - "Pages ship as static HTML with no front-end framework; the only JavaScript is small, optional enhancements."
  - "The About page photo is served as AVIF or WebP at 6 to 44 KB, depending on screen size, instead of the original 1.7 MB."
  - "The News page refreshes four times a day without a server, through a scheduled GitHub Actions build."
---

## What I built

- A personal site built with Astro: home, projects with technology filters, case studies, blog, about, contact, and a news page.
- Projects and blog posts are Markdown files in Astro content collections. Their frontmatter is checked against a schema, so a missing title or date stops the build instead of breaking a page.
- Light and dark themes that follow the visitor's system setting or a toggle, applied before the first paint so the page never flashes the wrong colours.
- A small snake, drawn on a canvas, that follows the mouse, coils up, and falls asleep when the cursor rests. The logo, favicon, and the current-page marker in the menu are drawn from the same snake.
- An AI news page: a Python script collects the last 24 hours of AI stories from Hacker News, and the site rebuilds itself every 6 hours to keep it current.

## How it works

| Part | How it is built |
| --- | --- |
| Pages | Astro components rendered to static HTML at build time |
| Content | Markdown in content collections, with typed frontmatter |
| Styling | One stylesheet with design tokens; `light-dark()` colours for both themes |
| Fonts and images | Self-hosted fonts; photos converted to AVIF and WebP at several sizes |
| News | Python script (standard library only) calling the Hacker News search API |
| Hosting | GitHub Actions builds on every push and every 6 hours, then deploys to GitHub Pages |

## Details I cared about

- **Works without JavaScript.** Filters, the copy button, and the snake are added on top; without them every page still reads and navigates.
- **Accessible.** A skip link, visible keyboard focus, screen reader labels for icon buttons, and no motion for visitors who prefer reduced motion.
- **Search friendly.** Canonical URLs, social preview tags, a sitemap, and a robots.txt generated from the site settings.
- **Fails safely.** If Hacker News can't be reached during a scheduled build, nothing is deployed and the last good version of the site stays live.
