import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
export const getPublisherMetrics = () => apiRequest<unknown>("/publisher/metrics", { token: getAuthToken() });
