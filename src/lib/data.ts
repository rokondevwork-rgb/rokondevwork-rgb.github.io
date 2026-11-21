/**
 * Content for the "Below Grade" homepage and About page: the floors of the cross-section, the
 * engineering disciplines, the tool trench, the career core sample and the working principles.
 * Projects and blog posts live in content collections (src/content/), not here.
 */

/** One level of the cross-section. `depth` is in metres below street level. */
export interface Floor {
  code: string;
  /** Anchor on the homepage. */
  id: string;
  /** Short name for the elevator panel and keypad. */
  name: string;
  depth: number;
}

export const FLOORS: Floor[] = [
  { code: "L0", id: "l0", name: "Street level", depth: 0 },
  { code: "B1", id: "b1", name: "Service entrance", depth: 6 },
  { code: "B2", id: "b2", name: "Plant room", depth: 12 },
  { code: "B3", id: "b3", name: "Utility trench", depth: 18 },
  { code: "B4", id: "b4", name: "Vaults", depth: 24 },
  { code: "B5", id: "b5", name: "Excavation", depth: 30 },
  { code: "B6", id: "b6", name: "Core sample", depth: 36 },
  { code: "B7", id: "b7", name: "Foundations", depth: 42 },
  { code: "B8", id: "b8", name: "Service elevator", depth: 48 },
];

/** Pages outside the homepage, reached from the bottom of the elevator panel. */
export const SHEETS = [
  { code: "FN", href: "/blog/", name: "Field notes" },
  { code: "NR", href: "/news/", name: "News radio" },
  { code: "GR", href: "/games/", name: "Gaming room" },
];

/** The Gaming room's machines. Only `playable` ones open; the rest show as being built. */
export const GAMES = [
  {
    id: "brick-breaker",
    no: "01",
    title: "Brick breaker",
    status: "playable",
    blurb: "Knock down the wall one brick at a time. Three lives, and the ball gets faster every wall.",
    controls: "← → · mouse · drag",
  },
  {
    id: "pipeline-puzzle",
    no: "02",
    title: "Pipeline puzzle",
    status: "playable",
    blurb: "Turn the pipes so the raw supplier feed reaches one clean record. Every pipe is a new puzzle.",
    controls: "Click · tap · arrows + Enter",
  },
  {
    id: "snake",
    no: "03",
    title: "Snake",
    status: "playable",
    blurb: "A Python that eats bugs. Every five bugs it gets faster, and a golden bug is worth more for a few seconds.",
    controls: "Arrows · WASD · swipe",
  },
] as const;

/** Which floor a page belongs to, so the panel can light it up. */
export function floorForPath(path: string): string | undefined {
  if (path === "/") return "L0";
  if (path.startsWith("/about")) return "B1";
  if (path.startsWith("/projects")) return "B4";
  if (path.startsWith("/contact")) return "B8";
  if (path.startsWith("/blog")) return "FN";
  if (path.startsWith("/news")) return "NR";
  if (path.startsWith("/games")) return "GR";
  return undefined;
}

/** B2: the four disciplines, drawn as machines in the plant room. */
export const MACHINES = [
  {
    code: "API",
    name: "API engineering",
    line: "Fast, documented REST APIs that other teams can build on.",
    calls: ["FastAPI · Django · Flask", "JWT auth + access control", "Third-party hotel APIs"],
  },
  {
    code: "ETL",
    name: "Data pipelines",
    line: "Messy supplier feeds in, one clean dataset out.",
    calls: ["Supplier XML / JSON ingest", "Normalisation + mapping", "Scheduled processing"],
  },
  {
    code: "SQL",
    name: "Database architecture",
    line: "Schemas and queries that stay fast as the data grows.",
    calls: ["MySQL · PostgreSQL", "Query optimisation", "Integrity + consistency"],
  },
  {
    code: "AI",
    name: "AI automation",
    line: "Language models put to work inside real workflows.",
    calls: ["Summaries + classification", "Background workers", "Vector search"],
  },
];

/** B3: every tool is a pipe; what matters is what it connects to and where it was used. */
export interface Tool {
  name: string;
  works: string[];
  usedIn: string;
}

/**
 * Each layer is painted like the real utility line it resembles (the colour code used to mark
 * lines under a street). `tone` picks the CSS colour: var(--u-<tone>).
 */
export const TRENCH: { layer: string; tone: string; paint: string; tools: Tool[] }[] = [
  {
    layer: "Languages",
    tone: "white",
    paint: "White · where the dig starts",
    tools: [
      { name: "Python", works: ["FastAPI", "Django", "Flask", "Pandas", "Apache Flink"], usedIn: "Every project on this site." },
      { name: "JavaScript", works: ["React", "Next.js", "Astro"], usedIn: "Rentor, AdvocateHub, and this portfolio." },
    ],
  },
  {
    layer: "Frontend",
    tone: "orange",
    paint: "Orange · communication",
    tools: [
      { name: "React", works: ["JavaScript", "Next.js"], usedIn: "GorillaMove: frontend components and features." },
      { name: "Next.js", works: ["React", "FastAPI", "JavaScript"], usedIn: "InnHoSel and ConvaterPro dashboards." },
      { name: "Astro", works: ["JavaScript", "TypeScript", "Markdown", "GitHub Actions"], usedIn: "This portfolio: case studies, the blog and the self-updating news page." },
    ],
  },
  {
    layer: "Backend",
    tone: "red",
    paint: "Red · power",
    tools: [
      { name: "FastAPI", works: ["Next.js", "SQLAlchemy", "MySQL", "PostgreSQL", "Redis", "Kafka", "Celery", "Docker"], usedIn: "Hotel Content API, PMS, InnHoSel, AdvocateHub, Passport Scanner, ConvaterPro." },
      { name: "Django", works: ["PostgreSQL", "Python", "MailHog"], usedIn: "Rentor." },
      { name: "Flask", works: ["Python"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "Celery", works: ["Redis", "FastAPI", "MailHog", "AI automation"], usedIn: "AdvocateHub: reminders, file scans, reports." },
    ],
  },
  {
    layer: "Streaming",
    tone: "yellow",
    paint: "Yellow · gas under pressure",
    tools: [
      { name: "Kafka", works: ["FastAPI", "Apache Flink", "Docker"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "Apache Flink", works: ["Kafka", "MinIO", "PostgreSQL", "Python"], usedIn: "In my toolkit; no public project to show yet." },
    ],
  },
  {
    layer: "Data & AI",
    tone: "purple",
    paint: "Purple · reclaimed",
    tools: [
      { name: "SQLAlchemy", works: ["FastAPI", "MySQL", "PostgreSQL"], usedIn: "Hotel Content API, PMS." },
      { name: "Pandas", works: ["Python"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "Vector search", works: ["Python", "AI automation"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "AI automation", works: ["Celery", "FastAPI"], usedIn: "AdvocateHub: case summaries and file classification." },
    ],
  },
  {
    layer: "Storage",
    tone: "blue",
    paint: "Blue · held water",
    tools: [
      { name: "MySQL", works: ["FastAPI", "SQLAlchemy"], usedIn: "Hotel Content API, InnHoSel, AdvocateHub." },
      { name: "PostgreSQL", works: ["Django", "SQLAlchemy", "FastAPI", "Apache Flink"], usedIn: "PMS, Rentor, ConvaterPro." },
      { name: "Redis", works: ["FastAPI", "Celery"], usedIn: "Hotel Content API, AdvocateHub." },
      { name: "MinIO", works: ["Apache Flink", "Docker", "AWS"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "DynamoDB", works: ["AWS"], usedIn: "Artixcore Inc, 2023–24." },
    ],
  },
  {
    layer: "DevOps",
    tone: "green",
    paint: "Green · drains it all away",
    tools: [
      { name: "Docker", works: ["FastAPI", "Redis", "MySQL", "Kafka", "MinIO", "MailHog", "GitHub Actions"], usedIn: "Hotel Content API, AdvocateHub." },
      { name: "Linux", works: ["Docker", "Python", "FastAPI"], usedIn: "InnHoSel." },
      { name: "AWS", works: ["DynamoDB", "MinIO", "Docker", "Python"], usedIn: "Artixcore Inc: Lambda, API Gateway, EC2." },
    ],
  },
  {
    layer: "Tools",
    tone: "pink",
    paint: "Pink · survey marks",
    tools: [
      { name: "Git", works: ["GitHub"], usedIn: "Every project on this site." },
      { name: "GitHub", works: ["Git", "GitHub Actions"], usedIn: "Every project on this site." },
      { name: "GitHub Actions", works: ["GitHub", "Docker", "Astro"], usedIn: "This portfolio: builds the site and refreshes the news page." },
      { name: "MailHog", works: ["Django", "Celery", "Docker"], usedIn: "In my toolkit; no public project to show yet." },
    ],
  },
];

/** B3: real paths through the stack, played step by step along the trench. */
export const TRENCH_FLOWS: { id: string; name: string; hint: string; steps: { tool: string; what: string }[] }[] = [
  {
    id: "api",
    name: "API request",
    hint: "A page asks for a hotel",
    steps: [
      { tool: "Next.js", what: "The page asks for a hotel." },
      { tool: "FastAPI", what: "Checks the key and builds the query." },
      { tool: "Redis", what: "A cache hit answers at once." },
      { tool: "MySQL", what: "On a miss, the record is read here." },
    ],
  },
  {
    id: "stream",
    name: "Event stream",
    hint: "Supplier updates, live",
    steps: [
      { tool: "FastAPI", what: "Publishes each supplier update." },
      { tool: "Kafka", what: "Keeps the updates in order on a topic." },
      { tool: "Apache Flink", what: "Cleans and joins them as they arrive." },
      { tool: "MinIO", what: "Stores the result as files." },
    ],
  },
  {
    id: "mail",
    name: "Mail in dev",
    hint: "No real inbox gets test mail",
    steps: [
      { tool: "FastAPI", what: "A user action needs an email." },
      { tool: "Celery", what: "Sends it in the background." },
      { tool: "Redis", what: "Queues the task." },
      { tool: "MailHog", what: "Catches the email so it can be checked." },
    ],
  },
  {
    id: "ship",
    name: "Ship it",
    hint: "From commit to server",
    steps: [
      { tool: "Git", what: "A commit on a branch." },
      { tool: "GitHub", what: "Pull request and review." },
      { tool: "GitHub Actions", what: "Tests and builds." },
      { tool: "Docker", what: "Packs the image." },
      { tool: "AWS", what: "Runs it." },
    ],
  },
];

/** B6: the career core sample, oldest first. `months` sizes each band. */
export const ROLES = [
  {
    id: "gorillamove",
    company: "GorillaMove",
    role: "Junior Software Engineer",
    dates: "Nov 2022 – Sep 2023",
    months: 11,
    points: [
      "Developed and maintained frontend components and features in React.",
      "Optimised web applications for performance and scalability.",
    ],
  },
  {
    id: "artixcore",
    company: "Artixcore Inc",
    role: "Python Developer",
    dates: "Oct 2023 – Sep 2024",
    months: 12,
    points: [
      "Designed and developed Python-based software applications.",
      "Deployed applications with AWS Lambda, DynamoDB, API Gateway and EC2.",
    ],
  },
  {
    id: "innovate",
    company: "Innovate Solution",
    role: "Python Developer",
    dates: "Oct 2024 – now",
    current: true,
    months: 26,
    points: [
      "Collect and process supplier XML/JSON static data for hotel content platforms.",
      "Build FastAPI APIs for data collection and business operations.",
      "Integrate third-party hotel APIs and build business APIs on top of them.",
      "Extract, process and analyse data from web APIs.",
      "Keep database integrity, consistency and performance in check.",
    ],
  },
];

export const EDUCATION = "B.Sc. in CSE, European University of Bangladesh";

/** The deepest strata of the core sample, from the CV. Newest first. */
export const EDUCATION_LIST = [
  { degree: "B.Sc. in Computer Science and Engineering (CSE)", school: "European University of Bangladesh", grade: "CGPA 3.26 / 4.00" },
  { degree: "HSC (Science)", school: "Birampur Government College", grade: "GPA 3.33 / 5.00" },
  { degree: "SSC (Science)", school: "Adarsha High School, Dinajpur", grade: "GPA 4.06 / 5.00" },
];

/** B7: the load-bearing principles. Rewrite these in your own words. */
export const PRINCIPLES = [
  {
    title: "Trust the data",
    text: "Supplier data is messy. I validate and normalise it on the way in, so everything downstream can rely on it.",
  },
  {
    title: "Measure, then optimise",
    text: "I profile slow queries and endpoints before changing them, and keep the numbers to show what improved.",
  },
  {
    title: "Keep people in the loop",
    text: "Short updates, readable pull requests and docs the next developer can follow without asking.",
  },
];

/** B7 on the homepage: what presses down on the piles, and each pile's small proof. */
export const PILE_LOADS = ["Messy\nsupplier data", "Traffic", "New\nfeatures", "Deadlines"];

export const PILE_PROOFS = [
  {
    kind: "validator",
    title: "Validator · on the way in",
    rows: [
      { raw: '"stars": "4*"', clean: "4", ok: true },
      { raw: '" EXAMPLE GRAND - DHAKA"', clean: '"Example Grand Dhaka"', ok: true },
      { raw: '"geo": "23.79,abc"', clean: "sent back", ok: false },
    ],
  },
  {
    kind: "profile",
    title: "Profile · GET /v1/properties",
    before: "Before · full table scan",
    fix: "+ index on (city, stars)",
    after: "After · index scan",
    note: "Measured first, then fixed, numbers kept.",
  },
  {
    kind: "review",
    title: "Pull request · normalise supplier names",
    ticks: ["Checks passed", "Reviewed and approved", "docs/normalise.md updated"],
    update: "Update: dedupe is live for supplier B. C is next.",
  },
] as const;

/** The quote on the About floor. */
export const QUOTE =
  "I am a software developer by profession, a problem solver by practice and a philosopher by curiosity.";
