const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  // Frontmatter dates are parsed as UTC midnight; format in UTC so the day never shifts.
  timeZone: "UTC",
});

/** e.g. "7 Oct 2026" */
export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

/** e.g. "5 min ago", "3 h ago", "2 days ago". Both times are Unix timestamps in seconds. */
export function timeAgo(then: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - then) / 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
