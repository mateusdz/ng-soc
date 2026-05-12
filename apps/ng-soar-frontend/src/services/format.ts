export function formatDateTime(value?: string) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function humanizeStatus(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value.replaceAll("_", " ");
}
