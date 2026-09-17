import type { UserRole } from "../types/user";

export const COMMON_REGISTRATION_DESTINATION = "/profile";

export function roleHome(role: UserRole) {
  if (role === "publisher") return "/dashboard";
  if (role === "admin") return "/admin";
  return "/";
}

export function publishingEntryRedirect(role: UserRole) {
  if (role === "publisher") return "/dashboard";
  if (role === "admin") return "/profile";
  return null;
}
