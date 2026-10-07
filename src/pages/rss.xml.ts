import rss from "@astrojs/rss";
import { BLOG } from "../consts";
import { getPublishedPosts } from "../lib/content";

// Descriptions only: readers click through to the full post on the site.
export async function GET() {
  const posts = await getPublishedPosts();

  return rss({
    title: BLOG.title,
    description: BLOG.description,
    site: import.meta.env.SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: `/blog/${post.id}/`,
    })),
    customData: "<language>en</language>",
  });
}
