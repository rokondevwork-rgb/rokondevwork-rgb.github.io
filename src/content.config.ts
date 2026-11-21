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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      stack: z.array(z.string()),
      role: z.string().optional(),
      // http(s) only, so a bad value can never become a javascript: href
      link: z.url({ protocol: /^https?$/ }).optional(),
      featured: z.boolean().default(false),
      /** Also the vault number: order 1 is room V-01. */
      order: z.number().default(99),
      /** Shown in the case-study title block, e.g. "Hotel and travel tech". */
      domain: z.string().optional(),
      /** A picture of the project, shown in its vault room and at the top of its case study. */
      image: image().optional(),
      imageAlt: z.string().optional(),
      /** Marks the picture as a concept screen with sample data rather than a real screenshot. */
      imageIsConcept: z.boolean().default(false),
      /** Optional captions for the gallery pictures 1.png, 2.png, … in the project's image folder, in order. */
      galleryCaptions: z.array(z.string()).optional(),
      /** Case-study layers. Each one appears only when it is set. */
      problem: z.string().optional(),
      constraints: z.array(z.object({ label: z.string(), value: z.string(), note: z.string() })).optional(),
      /**
       * Sample data for the animated excavation on the homepage (B5): one request followed through
       * the five layers. Optional; without it B5 shows the plain layers.
       */
      excavation: z
        .object({
          /** The same record as different suppliers send it. */
          raw: z.array(z.object({ supplier: z.string(), text: z.string() })),
          /** The one clean record they become. */
          clean: z.string(),
          /** Supplier feeds that switch on, e.g. "A xml". */
          feeds: z.array(z.string()),
          /** Client keys: allowed ones open, the others are refused. */
          keys: z.array(z.object({ name: z.string(), ok: z.boolean() })),
          /** The answer typed out at the bottom, and a line under it. */
          answer: z.string(),
          outcome: z.string(),
          /** One line per layer for the live readout. */
          readout: z.array(z.string()).length(5),
          /** Lines for the processing log ticker. */
          log: z.array(z.string()),
        })
        .optional(),
      /** The request path, left to right, e.g. ["B2B client", "JWT auth", "FastAPI", "Redis", "MySQL"]. */
      architecture: z.array(z.object({ name: z.string(), kind: z.enum(["caller", "gate", "service", "store"]) })).optional(),
      /** Tables in the simplified data model, e.g. "rooms: property_id · type · capacity". */
      dataModel: z.array(z.string()).optional(),
      /** Outcomes you can share publicly. The Results layer only appears when this is set. */
      results: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, projects };
