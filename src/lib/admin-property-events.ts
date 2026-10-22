import type { AdminProperty } from "../types/admin";

export const ADMIN_PROPERTY_STATUS_CHANGED = "inmuconnect:admin-property-status-changed";

export type AdminPropertyStatusChange = {
  before: AdminProperty["publicationStatus"];
  after: AdminProperty["publicationStatus"];
};
