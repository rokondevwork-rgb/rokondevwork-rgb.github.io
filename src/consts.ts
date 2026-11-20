// Site-wide details, used by the layout, pages and SEO tags.

export const SITE = {
  name: "Rokunuzzaman Rokon",
  title: "Rokunuzzaman Rokon | Python Backend Developer",
  description:
    "Python backend developer in Dhaka building scalable APIs, hotel content platforms, data processing pipelines, and database-driven applications.",
  /** One-line positioning statement, used at street level on the homepage. */
  tagline: "Most of what I build, you never see.",
  /** The roles under the tagline. */
  roles: "Software engineer · Python backend · Databases",
  /** Experience, counted from the first professional role in Nov 2022. */
  experience: "4 years, since Nov 2022",
};

/** Technology filters on the projects page ("All" is added automatically). */
export const PROJECT_FILTERS = ["FastAPI", "Django", "MySQL", "PostgreSQL", "React.js"];

// Blog index page details.
export const BLOG = {
  description: "Notes on Python, FastAPI, MySQL, and building data pipelines.",
};

// Public contact details. The number is shown on purpose, for WhatsApp, on the contact page.
export const CONTACT = {
  email: "rokon.raz@gmail.com",
  whatsapp: {
    /** Digits only, international format, as wa.me links need it. */
    number: "8801739933258",
    display: "+880 1739-933258",
  },
  github: "https://github.com/RoknuzzamanRokon",
  linkedin: "https://www.linkedin.com/in/rokon-raz",
  /** CV served from public/. Replace the file there to update it; keep the name. */
  cv: "/rokunuzzaman-rokon-cv.pdf",
};
