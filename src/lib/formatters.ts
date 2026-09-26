export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatRelativeDate(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, amount] of intervals) {
    const interval = Math.floor(seconds / amount);
    if (interval >= 1) {
      return formatter.format(-interval, unit);
    }
  }

  return "just now";
}
