import type { AuthResponse, ChangePasswordInput, ForgotPasswordInput, MessageResponse, LoginInput, RegisterInput, RegisterResponse, ResetPasswordInput } from "../types/user.ts";
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
  return apiRequest<RegisterResponse>("/auth/register", { method: "POST", body });
}

export const verifyEmail = (token: string) => apiRequest<MessageResponse>("/auth/verify-email", { method: "POST", body: { token } });
export const resendVerification = (email: string) => apiRequest<MessageResponse>("/auth/resend-verification", { method: "POST", body: { email } });
export const forgotPassword = (data: ForgotPasswordInput) => apiRequest<MessageResponse>("/auth/forgot-password", { method: "POST", body: data });
export const resetPassword = (data: ResetPasswordInput) => apiRequest<MessageResponse>("/auth/reset-password", { method: "POST", body: data });
export const changePassword = (data: ChangePasswordInput) => apiRequest<MessageResponse>("/auth/change-password", { method: "PATCH", token: getAuthToken(), body: data });

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
