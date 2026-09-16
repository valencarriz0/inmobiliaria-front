export const RECENT_PROPERTIES_KEY = "inmuconnect:recent-properties";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidPropertyId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

export function recentPropertyIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && isValidPropertyId(id)))].slice(0, 6)
    : [];
}

export function readRecentProperties(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_PROPERTIES_KEY);
    const ids = recentPropertyIds(JSON.parse(raw ?? "[]"));
    if (raw !== JSON.stringify(ids)) sessionStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(ids));
    return ids;
  } catch {
    return [];
  }
}

export function rememberProperty(id: string) {
  try {
    if (!isValidPropertyId(id)) return;
    sessionStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(recentPropertyIds([id, ...readRecentProperties()])));
  } catch {
    // La navegación sigue disponible si el navegador bloquea el almacenamiento.
  }
}
