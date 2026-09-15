import type { UserFormValues, UserProfile, UserRole } from "../types/user.ts";
import { validateEmail, validateName, validatePassword, validatePasswordConfirmation, validatePhone } from "./validation.ts";

export function createUserFormValues(user?: UserProfile): UserFormValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    publisherType: user?.role === "publisher" ? user.publisherType : "",
    taxId: user?.role === "publisher" ? user.taxId : "",
    agencyName: user?.role === "publisher" && user.publisherType === "agency" ? user.agencyName : "",
    password: "",
    passwordConfirm: "",
  };
}

export function validateTaxId(value: string) {
  if (!value.trim()) return "El CUIT/CUIL es obligatorio.";
  if (!/^[\d-]+$/.test(value.trim()) || value.replace(/\D/g, "").length !== 11) {
    return "Ingresá 11 dígitos; podés incluir guiones.";
  }
}

export function validateUserForm(values: UserFormValues, role: UserRole, withPassword = false) {
  const publisher = role === "publisher";
  return {
    firstName: validateName(values.firstName, "nombre"),
    lastName: validateName(values.lastName, "apellido"),
    email: validateEmail(values.email),
    phone: publisher || values.phone.trim() ? validatePhone(values.phone) : undefined,
    publisherType: publisher && values.publisherType !== "individual" && values.publisherType !== "agency"
      ? "Seleccioná el tipo de publicador." : undefined,
    taxId: publisher ? validateTaxId(values.taxId) : undefined,
    agencyName: publisher && values.publisherType === "agency" && !values.agencyName.trim()
      ? "El nombre / razón social de la inmobiliaria es obligatorio." : undefined,
    password: withPassword ? validatePassword(values.password) : undefined,
    passwordConfirm: withPassword ? validatePasswordConfirmation(values.passwordConfirm, values.password) : undefined,
  };
}

export function toUserProfile(values: UserFormValues, role: UserRole): UserProfile | undefined {
  if (Object.values(validateUserForm(values, role)).some(Boolean)) return;
  const contact = {
    firstName: values.firstName.trim(), lastName: values.lastName.trim(),
    email: values.email.trim(), phone: values.phone.trim(),
  };
  if (role !== "publisher") return { ...contact, role };
  const taxId = values.taxId.replace(/\D/g, "");
  return values.publisherType === "agency"
    ? { ...contact, role, publisherType: "agency", taxId, agencyName: values.agencyName.trim() }
    : { ...contact, role, publisherType: "individual", taxId };
}
