/**
 * Project pictures, one folder per project.
 *
 *   src/assets/projects/<project-slug>/
 *     hero.png   → the big picture at the top of the case study and in its vault room
 *     1.png      → gallery picture 1 (Exhibit 02)
 *     2.png      → gallery picture 2 (Exhibit 03)
 *     3.png …    → as many as you like, shown in number order
 *
 * The folder name must match the project's Markdown file name, which is also its URL:
 * src/content/projects/hotel-content-api.md → /projects/hotel-content-api/ → hotel-content-api/.
 * png, jpg, jpeg, webp and avif all work. Add or replace a file and it shows up on the next
 * build; no code or frontmatter change is needed. Captions are optional (`galleryCaptions`).
 */
import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";

const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/projects/*/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,avif,AVIF}",
  { eager: true },
);

interface Folder {
  hero?: ImageMetadata;
  gallery: { n: number; src: ImageMetadata }[];
}

const folders = new Map<string, Folder>();

for (const [path, mod] of Object.entries(files)) {
  const match = path.match(/\/projects\/([^/]+)\/([^/]+)\.[a-z]+$/i);
  if (!match) continue;
  const [, slug, name] = match;
  const folder = folders.get(slug) ?? { gallery: [] };
  folders.set(slug, folder);
  if (name.toLowerCase() === "hero") folder.hero = mod.default;
  else if (/^\d+$/.test(name)) folder.gallery.push({ n: Number(name), src: mod.default });
}

export interface ProjectPicture {
  src: ImageMetadata;
  alt: string;
  caption?: string;
}

export interface ProjectPictures {
  hero?: ProjectPicture;
  gallery: ProjectPicture[];
}

export function getProjectPictures(project: CollectionEntry<"projects">): ProjectPictures {
  const { title, image, imageAlt, galleryCaptions = [] } = project.data;
  const folder = folders.get(project.id);
  // The folder's hero wins; the old `image:` frontmatter field still works as a fallback.
  const heroSrc = folder?.hero ?? image;
  const gallery = (folder?.gallery ?? [])
    .sort((a, b) => a.n - b.n)
    .map(({ src }, i) => {
      const caption = galleryCaptions[i]?.trim() || undefined;
      return { src, caption, alt: caption ?? `${title}, screen ${i + 1}` };
    });
  return {
    hero: heroSrc ? { src: heroSrc, alt: imageAlt ?? `${title}, main screen` } : undefined,
    gallery,
  };
}
