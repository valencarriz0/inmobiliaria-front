import type { AuthUser, UserFormValues, UserRole } from "../types/user.ts";
import type { PublicPublisherApplicationInput, PublisherApplicationInput } from "../types/publisher-application.ts";
import { validateEmail, validateName, validatePassword, validatePasswordConfirmation, validatePhone } from "./validation.ts";

export function createUserFormValues(user?: AuthUser): UserFormValues {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    publisherType: "",
    taxId: "",
    agencyName: "",
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

export function validateUserForm(values: UserFormValues, role: UserRole, withPassword = false, publisherFields = role === "publisher") {
  const phoneRequired = role === "publisher";
  return {
    firstName: validateName(values.firstName, "nombre"),
    lastName: validateName(values.lastName, "apellido"),
    email: validateEmail(values.email),
    phone: phoneRequired || values.phone.trim() ? validatePhone(values.phone) : undefined,
    publisherType: publisherFields && values.publisherType !== "individual" && values.publisherType !== "agency"
      ? "Seleccioná el tipo de publicador." : undefined,
    taxId: publisherFields ? validateTaxId(values.taxId) : undefined,
    agencyName: publisherFields && values.publisherType === "agency" && !values.agencyName.trim()
      ? "El nombre / razón social de la inmobiliaria es obligatorio." : undefined,
    password: withPassword ? validatePassword(values.password) : undefined,
    passwordConfirm: withPassword ? validatePasswordConfirmation(values.passwordConfirm, values.password) : undefined,
  };
}

export function registrationInput(values: UserFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    password: values.password,
    passwordConfirm: values.passwordConfirm,
  };
}

export function profileInput(values: UserFormValues) {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim() || null,
  };
}

export function publisherApplicationInput(values: UserFormValues): PublisherApplicationInput {
  const publisherType = values.publisherType === "agency" ? "agency" : "individual";
  return {
    publisherType,
    taxId: values.taxId.replace(/\D/g, ""),
    agencyName: publisherType === "agency" ? values.agencyName.trim() : null,
    phone: values.phone.trim(),
  };
}

export function publicPublisherApplicationInput(values: UserFormValues): PublicPublisherApplicationInput {
  return {
    ...publisherApplicationInput(values),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    password: values.password,
    passwordConfirm: values.passwordConfirm,
  };
}
