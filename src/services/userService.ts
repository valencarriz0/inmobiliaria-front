import type { AuthUser, UpdateProfileInput } from "../types/user.ts";
import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

export function updateMe(data: UpdateProfileInput) {
  const body: UpdateProfileInput = {};
  if (data.firstName !== undefined) body.firstName = data.firstName;
  if (data.lastName !== undefined) body.lastName = data.lastName;
  if (data.phone !== undefined) body.phone = data.phone;
  return apiRequest<{ user: AuthUser }>("/users/me", {
    method: "PATCH",
    token: getAuthToken(),
    body,
  });
}
