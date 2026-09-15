export type UserRole = "interested" | "publisher" | "admin";
export type AccountStatus = "active" | "disabled";
export type PublisherType = "individual" | "agency";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  publisherType: PublisherType | "";
  taxId: string;
  agencyName: string;
  password: string;
  passwordConfirm: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  passwordConfirm: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
