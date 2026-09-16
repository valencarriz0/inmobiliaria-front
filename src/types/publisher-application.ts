import type { AccountStatus, AuthUser, UserRole } from "./user";

export type PublisherType = "individual" | "agency";
export type PublisherApplicationStatus = "pending" | "approved" | "rejected";

export interface PublisherApplication {
  id: string;
  userId: string;
  publisherType: PublisherType;
  taxId: string;
  agencyName: string | null;
  phone: string;
  status: PublisherApplicationStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublisherApplicationApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
}

export interface PublisherApplicationWithApplicant extends PublisherApplication {
  applicant: PublisherApplicationApplicant;
}

export interface PublisherApplicationInput {
  publisherType: PublisherType;
  taxId: string;
  agencyName: string | null;
  phone: string;
}

export interface PublicPublisherApplicationInput extends PublisherApplicationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface PublicPublisherApplicationResponse {
  user: AuthUser;
  application: PublisherApplication;
  verificationRequired: true;
  message: string;
}
