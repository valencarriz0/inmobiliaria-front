const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

export type ApiErrorDetails = Record<string, string>;

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetails;
  code?: string;

  constructor(status: number, message: string, details?: ApiErrorDetails, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

interface ErrorPayload {
  error?: unknown;
  details?: unknown;
  code?: unknown;
}

function apiBaseUrl() {
  return (import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

async function parseJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function safeDetails(value: unknown): ApiErrorDetails | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, token, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
      ...requestOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Intentá nuevamente.");
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    const errorPayload = payload && typeof payload === "object" ? payload as ErrorPayload : undefined;
    const message = typeof errorPayload?.error === "string"
      ? errorPayload.error
      : "No se pudo completar la solicitud. Intentá nuevamente.";
    throw new ApiError(response.status, message, safeDetails(errorPayload?.details), typeof errorPayload?.code === "string" ? errorPayload.code : undefined);
  }
  return payload as T;
}
