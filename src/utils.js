export async function fetchJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export function formatDateTime(iso, timeZone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timeZone || undefined
  }).format(new Date(iso));
}

export function formatDuration(mins, secs) {
  if (typeof secs === "number") {
    const mm = Math.floor(secs / 60);
    const ss = secs % 60;
    return `${mm}m ${ss}s`;
  }
  if (typeof mins === "number") return `${mins}m`;
  return "—";
}
