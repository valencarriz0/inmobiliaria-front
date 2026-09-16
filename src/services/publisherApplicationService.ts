import type {
  PublicPublisherApplicationInput,
  PublicPublisherApplicationResponse,
  PublisherApplication,
  PublisherApplicationInput,
  PublisherApplicationStatus,
  PublisherApplicationWithApplicant,
} from "../types/publisher-application";
import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

interface AuthorizedRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function authorizedRequest<T>(path: string, options: AuthorizedRequestOptions = {}) {
  return apiRequest<T>(path, { ...options, token: getAuthToken() });
}

export function createPublicPublisherApplication(data: PublicPublisherApplicationInput) {
  const body: PublicPublisherApplicationInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    publisherType: data.publisherType,
    taxId: data.taxId,
    agencyName: data.publisherType === "agency" ? data.agencyName : null,
  };
  return apiRequest<PublicPublisherApplicationResponse>("/publisher-applications/public", { method: "POST", body });
}

export function createPublisherApplication(data: PublisherApplicationInput) {
  const body: PublisherApplicationInput = {
    publisherType: data.publisherType,
    taxId: data.taxId,
    agencyName: data.publisherType === "agency" ? data.agencyName : null,
    phone: data.phone,
  };
  return authorizedRequest<{ application: PublisherApplication }>("/publisher-applications", { method: "POST", body });
}

export function getMyPublisherApplication() {
  return authorizedRequest<{ application: PublisherApplication | null }>("/publisher-applications/me");
}

export function getAdminPublisherApplications(status: PublisherApplicationStatus) {
  return authorizedRequest<{ applications: PublisherApplicationWithApplicant[] }>(`/admin/publisher-applications?status=${encodeURIComponent(status)}`);
}

export function approvePublisherApplication(id: string) {
  return authorizedRequest<{ application: PublisherApplication }>(`/admin/publisher-applications/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
    body: {},
  });
}

export function rejectPublisherApplication(id: string, rejectionReason?: string | null) {
  return authorizedRequest<{ application: PublisherApplication }>(`/admin/publisher-applications/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    body: { rejectionReason: rejectionReason?.trim() || null },
  });
}
