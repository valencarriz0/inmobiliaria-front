export type UserRole = "interested" | "publisher" | "admin";
export type PublisherType = "individual" | "agency";

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// El tipo de publicador modifica los datos del perfil, no los permisos.
export type UserProfile = ContactData & (
  | { role: "interested" | "admin" }
  | { role: "publisher"; publisherType: "individual"; taxId: string }
  | { role: "publisher"; publisherType: "agency"; taxId: string; agencyName: string }
);

export interface UserFormValues extends ContactData {
  publisherType: PublisherType | "";
  taxId: string;
  agencyName: string;
  password: string;
  passwordConfirm: string;
}
