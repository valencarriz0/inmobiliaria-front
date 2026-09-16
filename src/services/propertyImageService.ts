import { getAuthToken } from "./authStorage.ts";
import { apiRequest } from "./api.ts";

export type UploadedPropertyImage = { url: string; path: string };
export async function uploadPropertyImages(files: File[]) {
  const form = new FormData(); files.forEach((file) => form.append("images", file));
  const response = await fetch(`${(import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/$/, "")}/publisher/property-images`, { method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, body: form });
  if (!response.ok) throw new Error("No se pudieron subir las imágenes.");
  return (await response.json() as { images: UploadedPropertyImage[] }).images;
}
export function deletePropertyImages(paths: string[]) { return apiRequest<void>("/publisher/property-images", { method: "DELETE", token: getAuthToken(), body: { paths } }); }
