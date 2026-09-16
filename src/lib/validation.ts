import {
  CURRENCIES, OPERATION_TYPES, PROPERTY_TYPES, PROPERTY_CONDITIONS,
  PROPERTY_SERVICES, PROPERTY_AMENITIES, PROPERTY_IMAGE_RULES,
} from "../constants/property.ts";
import { getPropertyCities, PROPERTY_LOCATIONS } from "../constants/locations.ts";
import type { PropertyFormErrors, PropertyFormImage, PropertyFormValues } from "../types/property-form.ts";

export function validateEmail(value: string) {
  if (!value.trim()) return "El correo electrónico es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Ingresá un correo válido, por ejemplo: nombre@correo.com.";
  }
}

export function validatePassword(value: string) {
  if (!value.trim()) return "La contraseña es obligatoria.";
  if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
  if (value.length > 72 || new TextEncoder().encode(value).length > 72) {
    return "La contraseña no puede superar 72 caracteres ni 72 bytes.";
  }
}

export function validatePasswordConfirmation(value: string, password: string) {
  if (!value) return "Repetí la contraseña.";
  if (value !== password) return "Las contraseñas no coinciden.";
}

export function validateName(value: string, label: string) {
  if (!value.trim()) return `El ${label} es obligatorio.`;
  if (value.trim().length < 2) return `El ${label} debe tener al menos 2 caracteres.`;
  if (!/^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value.trim())) {
    return `El ${label} solo puede contener letras, espacios, apóstrofes y guiones.`;
  }
}

export function validatePhone(value: string) {
  if (!value.trim()) return "El teléfono es obligatorio.";
  const digits = value.replace(/\D/g, "");
  if (!/^\+?[\d\s()-]+$/.test(value.trim()) || digits.length < 7 || digits.length > 15) {
    return "Ingresá un teléfono de entre 7 y 15 dígitos; podés incluir +, espacios o guiones.";
  }
}

export function validateNumber(
  value: string,
  label: string,
  { optional = false, integer = false, min = 0, exclusive = false } = {}
) {
  if (!value.trim()) return optional ? undefined : `${label} es obligatorio.`;
  const number = Number(value.trim().replace(",", "."));
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(value.trim()) || !Number.isFinite(number) || (integer && !Number.isInteger(number))) {
    return `${label} debe ser un número ${integer ? "entero" : "válido"}.`;
  }
  if (exclusive ? number <= min : number < min) {
    return `${label} debe ser ${exclusive ? "mayor a" : "igual o mayor a"} ${min}.`;
  }
}

export function validateImage(file: File | null) {
  if (!file) return;
  if (!PROPERTY_IMAGE_RULES.mimeTypes.some((type) => type === file.type)) {
    return `Elegí una imagen ${PROPERTY_IMAGE_RULES.formatsLabel}.`;
  }
  if (file.size === 0) return "La imagen está vacía. Elegí otro archivo.";
  if (file.size > PROPERTY_IMAGE_RULES.maxSizeMB * 1024 * 1024) {
    return `Cada imagen puede pesar hasta ${PROPERTY_IMAGE_RULES.maxSizeMB} MB.`;
  }
}

// Used before adding files: an incomplete selection is allowed while filling the form.
export function validateImageSelection(images: readonly PropertyFormImage[]) {
  if (images.length > PROPERTY_IMAGE_RULES.max) {
    return `Podés incluir hasta ${PROPERTY_IMAGE_RULES.max} imágenes. Seleccioná menos archivos o eliminá una imagen.`;
  }
  for (const image of images) {
    if (image.kind === "new") {
      const error = validateImage(image.file);
      if (error) return `${image.file.name}: ${error}`;
    // Existing URLs have no size/MIME metadata; only new Files can be checked locally.
    } else if (!image.url.trim()) {
      return "Una imagen existente no tiene URL. Eliminála y seleccioná otra imagen.";
    }
  }
}

export function validatePropertyImages(images: readonly PropertyFormImage[]) {
  const error = validateImageSelection(images);
  if (error) return error;
  if (images.length < PROPERTY_IMAGE_RULES.min) {
    return `Agregá al menos ${PROPERTY_IMAGE_RULES.min} imágenes. La primera será la principal.`;
  }
}

export function isOptionKey<T extends object>(options: T, value: string): value is Extract<keyof T, string> {
  return Object.hasOwn(options, value);
}

export function validatePropertyForm(values: PropertyFormValues): PropertyFormErrors {
  const errors: PropertyFormErrors = {};
  if (!values.title.trim()) errors.title = "Ingresá el título de la propiedad.";
  if (!values.description.trim()) errors.description = "Ingresá una descripción de la propiedad.";
  if (!isOptionKey(OPERATION_TYPES, values.operationType)) errors.operationType = "Seleccioná una categoría válida.";
  if (!isOptionKey(PROPERTY_TYPES, values.propertyType)) errors.propertyType = "Seleccioná un tipo de inmueble válido.";
  if (!CURRENCIES.some((currency) => currency === values.currency)) errors.currency = "Seleccioná una moneda válida.";
  if (!values.provinceId && !isOptionKey(PROPERTY_LOCATIONS, values.province)) errors.province = "Seleccioná una provincia válida.";
  if (!values.cityId && !getPropertyCities(values.province).includes(values.city)) errors.city = "Seleccioná una localidad de la provincia elegida.";
  if (values.propertyCondition && !isOptionKey(PROPERTY_CONDITIONS, values.propertyCondition)) {
    errors.propertyCondition = "Seleccioná un estado del inmueble válido o dejalo sin especificar.";
  }
  if (values.acceptsPets !== "" && values.acceptsPets !== "yes" && values.acceptsPets !== "no") {
    errors.acceptsPets = "Indicá sí, no o no especificado.";
  }
  if (values.services.some((service) => !isOptionKey(PROPERTY_SERVICES, service))) errors.services = "Seleccioná servicios de la lista.";
  if (values.amenities.some((amenity) => !isOptionKey(PROPERTY_AMENITIES, amenity))) errors.amenities = "Seleccioná comodidades de la lista.";

  errors.number = validateNumber(values.number, "La altura", { optional: true, integer: true });
  errors.price = validateNumber(values.price, "El precio", { exclusive: true });
  errors.totalArea = validateNumber(values.totalArea, "La superficie total", { exclusive: true });
  errors.rooms = validateNumber(values.rooms, "La cantidad de ambientes", { integer: true, min: 1 });
  errors.bedrooms = validateNumber(values.bedrooms, "La cantidad de dormitorios", { optional: true, integer: true });
  errors.bathrooms = validateNumber(values.bathrooms, "La cantidad de baños", { optional: true, integer: true });
  errors.garage = validateNumber(values.garage, "La cantidad de cocheras", { optional: true, integer: true });
  errors.age = validateNumber(values.age, "La antigüedad en años", { optional: true, integer: true });
  errors.expenses = validateNumber(values.expenses, "Las expensas", { optional: true });
  errors.taxes = validateNumber(values.taxes, "Los impuestos", { optional: true });
  errors.commissions = validateNumber(values.commissions, "Las comisiones", { optional: true });
  errors.images = validatePropertyImages(values.images);
  return errors;
}
