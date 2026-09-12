export function validateEmail(value: string) {
  if (!value.trim()) return "El correo electrónico es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Ingresá un correo válido, por ejemplo: nombre@correo.com.";
  }
}

export function validatePassword(value: string) {
  if (!value.trim()) return "La contraseña es obligatoria.";
  if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
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
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Elegí una imagen JPG, PNG o WebP.";
  }
  if (file.size === 0) return "La imagen está vacía. Elegí otro archivo.";
  if (file.size > 5 * 1024 * 1024) return "Cada imagen puede pesar hasta 5 MB.";
}

interface PropertyValues {
  title: string;
  province: string;
  city: string;
  street: string;
  number: string;
  propertyType: string;
  category: string;
  price: string;
  currency: string;
  area: string;
  rooms: string;
  bathrooms: string;
  garages: string;
  description: string;
  images: (File | null)[];
}

export function validateProperty(values: PropertyValues, minimumImages: number) {
  const errors: Record<string, string | undefined> = {};
  const required = {
    title: "El título", province: "La provincia", city: "La localidad",
    street: "La calle", propertyType: "El tipo de propiedad", category: "La categoría",
    currency: "La moneda", description: "La descripción",
  } as const;
  for (const [field, label] of Object.entries(required)) {
    if (!values[field as keyof typeof required].trim()) errors[field] = `${label} es obligatorio.`;
  }
  errors.number = validateNumber(values.number, "La altura", { optional: true, integer: true });
  errors.price = validateNumber(values.price, "El precio", { exclusive: true });
  errors.area = validateNumber(values.area, "La superficie", { exclusive: true });
  errors.rooms = validateNumber(values.rooms, "La cantidad de ambientes", { integer: true, min: 1 });
  errors.bathrooms = validateNumber(values.bathrooms, "La cantidad de baños", { integer: true });
  errors.garages = validateNumber(values.garages, "La cantidad de cocheras", { optional: true, integer: true });
  errors.images = values.images.map(validateImage).find(Boolean);
  if (!errors.images && (!values.images[0] || values.images.filter(Boolean).length < minimumImages)) {
    errors.images = minimumImages === 1
      ? "Subí una imagen principal."
      : `Subí al menos ${minimumImages} imágenes, incluyendo la principal.`;
  }
  return errors;
}
