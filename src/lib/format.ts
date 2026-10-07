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
