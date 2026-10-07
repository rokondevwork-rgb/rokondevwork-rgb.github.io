import { getCollection } from "astro:content";

/** Posts newest first. Drafts show in `astro dev` but never in a production build. */
export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Projects sorted by `order`, then title. */
export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export async function getFeaturedProjects() {
  return (await getProjects()).filter((project) => project.data.featured);
}
