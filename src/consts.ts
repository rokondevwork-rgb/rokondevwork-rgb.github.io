// Site-wide details, used by the layout, pages and (later) RSS/SEO tags.

export const SITE = {
  name: "Rokunuzzaman Rokon",
  title: "Rokunuzzaman Rokon | Python Backend Developer",
  description:
    "Python backend developer in Dhaka building scalable APIs, hotel content platforms, data processing pipelines, and database-driven applications.",
  /** One-line positioning statement, used in the home page hero. */
  tagline:
    "I build the backend that keeps hotel data moving: the APIs, pipelines and databases behind it.",
};

/** Technology filters on the projects page ("All" is added automatically). */
export const PROJECT_FILTERS = ["FastAPI", "Django", "MySQL", "PostgreSQL", "React.js"];

/** Core stack shown on the home page (from the CV's core skills). */
export const TECH_STACK = [
  "Python",
  "FastAPI",
  "Django",
  "Flask",
  "MySQL",
  "PostgreSQL",
  "SQLAlchemy",
  "Redis",
  "Docker",
  "AWS",
  "Linux",
];

// Shared by the blog index page and the RSS feed.
export const BLOG = {
  title: `${SITE.name} | Blog`,
  description: "Notes on Python, FastAPI, MySQL, and building data pipelines.",
};

// Public contact details. The phone number is left out on purpose: public pages get scraped.
export const CONTACT = {
  email: "rokon.raz@gmail.com",
  github: "https://github.com/RoknuzzamanRokon",
  linkedin: "https://www.linkedin.com/in/rokon-raz",
};
