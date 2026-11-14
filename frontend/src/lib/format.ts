const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function formatDateTime(isoDate: string) {
  return dateTimeFormatter.format(new Date(isoDate));
}

export function formatShortDateTime(isoDate: string) {
  return shortDateTimeFormatter.format(new Date(isoDate));
}
