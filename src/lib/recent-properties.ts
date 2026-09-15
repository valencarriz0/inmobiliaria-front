export const RECENT_PROPERTIES_KEY = "inmuconnect:recent-properties";

export function recentPropertyIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && Boolean(id.trim())))].slice(0, 6)
    : [];
}

export function readRecentProperties(): string[] {
  try {
    return recentPropertyIds(JSON.parse(sessionStorage.getItem(RECENT_PROPERTIES_KEY) ?? "[]"));
  } catch {
    return [];
  }
}

export function rememberProperty(id: string) {
  try {
    sessionStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(recentPropertyIds([id, ...readRecentProperties()])));
  } catch {
    // La navegación sigue disponible si el navegador bloquea el almacenamiento.
  }
}
