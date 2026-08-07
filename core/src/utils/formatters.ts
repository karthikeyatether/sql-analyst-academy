export function formatStudyTime(totalMinutes: number): string {
  const mins = Math.max(0, Math.floor(totalMinutes || 0));
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `${remainingMins} min${remainingMins === 1 ? "" : "s"}`;
  }
  if (remainingMins === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }
  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMins} min${remainingMins === 1 ? "" : "s"}`;
}

export function stripLineNumbersFromQuery(sql: string): string {
  if (!sql) return "";
  const lines = sql.split("\n");
  let matches = 0;
  for (const line of lines) {
    if (/^\s*\d{1,3}(?=[A-Za-z\s\-\/\*]|$)/.test(line)) {
      matches++;
    }
  }
  if (matches >= 2) {
    return lines.map((l) => l.replace(/^\s*\d{1,3}/, "")).join("\n");
  }
  return sql;
}
