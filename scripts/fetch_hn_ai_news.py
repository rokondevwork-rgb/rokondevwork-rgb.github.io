"""Collect AI-related Hacker News stories from the last 24 hours for the News page.

Writes src/data/news.json, which src/pages/news.astro reads at build time. The deploy workflow
runs this before every build, and every 6 hours on a schedule, so the page stays current.

Data comes from the HN Algolia search API (https://hn.algolia.com/api): one request returns
stories with their points and comment counts, filtered by time. Standard library only.

Usage: python scripts/fetch_hn_ai_news.py   (or: npm run news)
"""

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://hn.algolia.com/api/v1/search_by_date"
OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "news.json"

WINDOW = 24 * 60 * 60  # seconds: the last 24 hours
MIN_POINTS = 10  # most new submissions sit at 1-2 points; this keeps the ones people upvoted
MAX_STORIES = 50
PER_PAGE = 1000  # the API's maximum
TIMEOUT = 30  # seconds per request

# Story titles are matched against these. Short acronyms must match as whole, upper-case words
# ("AI", but not "Airbnb" or "said"); everything else is case-insensitive.
ACRONYMS = re.compile(r"\b(AI|AGI|A\.I\.|LLMs?|GPTs?|ML|NLP|RAG)\b")
KEYWORDS = re.compile(
    r"\b("
    + "|".join(
        [
            r"artificial intelligence",
            r"machine learning",
            r"deep learning",
            r"neural (?:net|network)s?",
            r"(?:large )?language models?",
            r"computer vision",
            r"chat ?gpt",
            r"gpt-?\d[\w.]*",
            r"openai",
            r"anthropic",
            r"claude",
            r"gemini",
            r"deepmind",
            r"deepseek",
            r"llama",
            r"mistral",
            r"qwen",
            r"xai",
            r"copilot",
            r"hugging ?face",
            r"stable diffusion",
            r"midjourney",
            r"agentic",
            r"chatbots?",
            r"fine-?tun\w*",
            r"embeddings?",
            r"prompt (?:engineering|injection)",
            r"vibe ?cod\w*",
        ]
    )
    + r")\b",
    re.IGNORECASE,
)


def is_ai(title: str) -> bool:
    return bool(ACRONYMS.search(title) or KEYWORDS.search(title))


def fetch_page(since: int, page: int) -> dict:
    query = urllib.parse.urlencode(
        {
            "tags": "story",
            "numericFilters": f"created_at_i>{since},points>={MIN_POINTS}",
            "hitsPerPage": PER_PAGE,
            "page": page,
            "attributesToRetrieve": "title,url,author,points,num_comments,created_at_i",
            "attributesToHighlight": "",
        }
    )
    request = urllib.request.Request(
        f"{API}?{query}",
        headers={"User-Agent": "rokon-portfolio news page (+https://rokondevwork-rgb.github.io/news/)"},
    )
    with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
        return json.load(response)


def fetch_stories(since: int) -> list[dict]:
    hits, page = [], 0
    while True:
        data = fetch_page(since, page)
        hits.extend(data["hits"])
        page += 1
        if page >= data.get("nbPages", 0):
            return hits


def to_story(hit: dict) -> dict:
    hn_url = f"https://news.ycombinator.com/item?id={hit['objectID']}"
    # Ask HN and similar posts have no link of their own: point them at the discussion.
    url = hit.get("url") or hn_url
    domain = urllib.parse.urlsplit(url).hostname or ""
    return {
        "id": hit["objectID"],
        "title": hit["title"],
        "url": url,
        "domain": domain.removeprefix("www."),
        "hnUrl": hn_url,
        "author": hit.get("author") or "",
        "points": hit.get("points") or 0,
        "comments": hit.get("num_comments") or 0,
        "time": hit["created_at_i"],
    }


def main() -> int:
    now = int(time.time())
    try:
        hits = fetch_stories(now - WINDOW)
    except (OSError, ValueError) as error:  # network errors, timeouts, bad JSON
        # Fail loudly: the deploy stops and the last good page stays live.
        print(f"Could not fetch Hacker News stories: {error}", file=sys.stderr)
        return 1

    stories = [to_story(hit) for hit in hits if hit.get("title") and is_ai(hit["title"])]
    # If there are too many, keep the most upvoted; then list them newest first.
    stories.sort(key=lambda story: -story["points"])
    stories = sorted(stories[:MAX_STORIES], key=lambda story: -story["time"])

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"updated": now, "minPoints": MIN_POINTS, "stories": stories}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"{len(stories)} AI stories (of {len(hits)} with {MIN_POINTS}+ points) -> {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
