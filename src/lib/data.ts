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
  { code: "SR", href: "/news/", name: "Site radio" },
  { code: "BR", href: "/games/", name: "Break room" },
];

/** The Break room's machines. Only `playable` ones open; the rest show as being built. */
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
    id: "bug-hunt",
    no: "03",
    title: "Bug hunt",
    status: "building",
    blurb: "Bugs hide in the building's windows. Catch as many as you can in 30 seconds.",
    controls: "Click or tap",
  },
] as const;

/** Which floor a page belongs to, so the panel can light it up. */
export function floorForPath(path: string): string | undefined {
  if (path === "/") return "L0";
  if (path.startsWith("/about")) return "B1";
  if (path.startsWith("/projects")) return "B4";
  if (path.startsWith("/contact")) return "B8";
  if (path.startsWith("/blog")) return "FN";
  if (path.startsWith("/news")) return "SR";
  if (path.startsWith("/games")) return "BR";
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
  /** Storage is drawn in teal: anything that holds data at rest. */
  storage?: boolean;
  works: string[];
  usedIn: string;
}

export const TRENCH: { layer: string; tools: Tool[] }[] = [
  {
    layer: "Languages",
    tools: [
      { name: "Python", works: ["FastAPI", "Django", "Flask", "SQLAlchemy", "Pandas"], usedIn: "Every project on this site." },
      { name: "JavaScript", works: ["React.js", "Next.js", "Astro"], usedIn: "Rentor, AdvocateHub, and this portfolio." },
    ],
  },
  {
    layer: "Frameworks",
    tools: [
      { name: "FastAPI", works: ["SQLAlchemy", "MySQL", "PostgreSQL", "Redis", "Docker"], usedIn: "Hotel Content API, PMS, InnHoSel, AdvocateHub, Passport Scanner." },
      { name: "Django", works: ["PostgreSQL", "Python"], usedIn: "Rentor, ConvaterPro." },
      { name: "Flask", works: ["Python"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "Astro", works: ["JavaScript", "TypeScript", "Markdown", "GitHub Actions"], usedIn: "This portfolio: case studies, the blog and the self-updating news page." },
      { name: "Celery", works: ["Redis", "FastAPI", "AI automation"], usedIn: "AdvocateHub: reminders, file scans, reports." },
    ],
  },
  {
    layer: "Data",
    tools: [
      { name: "SQLAlchemy", works: ["FastAPI", "MySQL", "PostgreSQL"], usedIn: "Hotel Content API, PMS." },
      { name: "Pandas", works: ["Python"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "Vector search", works: ["Python", "AI automation"], usedIn: "In my toolkit; no public project to show yet." },
      { name: "AI automation", works: ["Celery", "FastAPI"], usedIn: "AdvocateHub: case summaries and file classification." },
    ],
  },
  {
    layer: "Storage",
    tools: [
      { name: "MySQL", storage: true, works: ["FastAPI", "SQLAlchemy"], usedIn: "Hotel Content API, InnHoSel, AdvocateHub." },
      { name: "PostgreSQL", storage: true, works: ["Django", "SQLAlchemy", "FastAPI"], usedIn: "PMS, Rentor, ConvaterPro." },
      { name: "Redis", storage: true, works: ["FastAPI", "Celery"], usedIn: "Hotel Content API, AdvocateHub." },
      { name: "DynamoDB", storage: true, works: ["AWS"], usedIn: "Artixcore Inc, 2023–24." },
    ],
  },
  {
    layer: "Infra",
    tools: [
      { name: "Docker", works: ["FastAPI", "Redis", "MySQL"], usedIn: "Hotel Content API, AdvocateHub." },
      { name: "AWS", works: ["DynamoDB", "Python"], usedIn: "Artixcore Inc: Lambda, API Gateway, EC2." },
      { name: "Linux", works: ["Python", "FastAPI"], usedIn: "InnHoSel." },
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

/** The quote on the About floor. */
export const QUOTE =
  "I am a software developer by profession, a problem solver by practice and a philosopher by curiosity.";
