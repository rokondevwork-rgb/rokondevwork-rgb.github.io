import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    role: z.string().optional(),
    // http(s) only, so a bad value can never become a javascript: href
    link: z.url({ protocol: /^https?$/ }).optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    /** Shown in the case-study sidebar, e.g. "Hotel and travel tech". */
    domain: z.string().optional(),
    /** Outcomes you can share publicly. The Results section only appears when this is set. */
    results: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, projects };
