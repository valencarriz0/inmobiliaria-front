import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
import { deletePropertyImages, uploadPropertyImages } from "./propertyImageService.ts";
import type { CreatePropertyInput, UpdatePropertyInput } from "../types/property-input.ts";
import type { PublisherProperty, PropertyHistoryEntry } from "../types/publisher-property.ts";

type Response = { property: PublisherProperty };
const options = () => ({ token: getAuthToken() });
function payload(input: CreatePropertyInput) { const { data, images } = input; return { title: data.title, description: data.description, operationType: data.operationType, propertyType: data.propertyType, price: data.price, currency: data.currency, cityId: data.location.cityId, street: data.location.street, streetNumber: data.location.number, totalArea: data.totalArea, rooms: data.rooms, bedrooms: data.bedrooms, bathrooms: data.bathrooms, age: data.age, propertyCondition: data.propertyCondition, acceptsPets: data.acceptsPets, garage: data.garage, expenses: data.expenses, taxes: data.taxes, commissions: data.commissions, latitude: data.latitude, longitude: data.longitude, serviceCodes: data.services, amenityCodes: data.amenities, images }; }
async function withUploads(input: CreatePropertyInput, run: (images: string[]) => Promise<PublisherProperty>) {
  const newFiles = input.images.filter((image): image is { kind: "new"; file: File } => image.kind === "new").map((image) => image.file);
  const uploaded = newFiles.length ? await uploadPropertyImages(newFiles) : [];
  let uploadIndex = 0;
  const urls = input.images.map((image) => image.kind === "existing" ? image.url : uploaded[uploadIndex++]?.url).filter((url): url is string => Boolean(url));
  try { return await run(urls); } catch (error) { if (uploaded.length) await deletePropertyImages(uploaded.map((image) => image.path)).catch(() => undefined); throw error; }
}
export const publisherPropertyService = {
  list: () => apiRequest<{ properties: PublisherProperty[] }>("/publisher/properties", options()),
  detail: (id: string) => apiRequest<Response>(`/publisher/properties/${id}`, options()),
  create: (input: CreatePropertyInput) => withUploads(input, (images) => apiRequest<Response>("/publisher/properties", { ...options(), method: "POST", body: { ...payload(input), images } }).then((response) => response.property)),
  update: (id: string, input: UpdatePropertyInput) => withUploads(input, (images) => apiRequest<Response>(`/publisher/properties/${id}`, { ...options(), method: "PATCH", body: { ...payload(input), images } }).then((response) => response.property)),
  pause: (id: string) => apiRequest<Response>(`/publisher/properties/${id}/pause`, { ...options(), method: "PATCH" }),
  reactivate: (id: string) => apiRequest<Response>(`/publisher/properties/${id}/reactivate`, { ...options(), method: "PATCH" }),
  remove: (id: string) => apiRequest<Response>(`/publisher/properties/${id}`, { ...options(), method: "DELETE" }),
  history: (id: string) => apiRequest<{ history: PropertyHistoryEntry[] }>(`/publisher/properties/${id}/history`, options()),
};
