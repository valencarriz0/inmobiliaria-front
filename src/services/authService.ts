import type { AuthResponse, LoginInput, RegisterInput } from "../types/user.ts";
import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

export function register(data: RegisterInput) {
  const body: RegisterInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
  };
  return apiRequest<AuthResponse>("/auth/register", { method: "POST", body });
}

export function login(data: LoginInput) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email: data.email, password: data.password },
  });
}

export function getMe() {
  return apiRequest<Pick<AuthResponse, "user">>("/auth/me", {
    method: "GET",
    token: getAuthToken(),
  });
}
