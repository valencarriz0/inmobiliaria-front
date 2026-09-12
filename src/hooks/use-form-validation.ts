import { useId, useState } from "react";

export type FormErrors = Record<string, string | undefined>;

export function useFormValidation(validate: () => FormErrors) {
  const prefix = useId();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const validationErrors = validate();
  const errors: FormErrors = Object.fromEntries(
    Object.entries(validationErrors).filter(
      ([field, message]) => message && (submitted || touched[field])
    )
  );

  const touch = (field: string) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  };

  const fieldProps = (field: string) => ({
    id: `${prefix}-${field}`,
    name: field,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${prefix}-${field}-error` : undefined,
    onBlur: () => touch(field),
  });

  const errorId = (field: string) => `${prefix}-${field}-error`;

  const validateForm = (form: HTMLFormElement) => {
    setSubmitted(true);
    if (Object.values(validate()).some(Boolean)) {
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return false;
    }
    return true;
  };

  const resetValidation = () => {
    setTouched({});
    setSubmitted(false);
  };

  return { errors, fieldProps, errorId, validateForm, resetValidation, touch };
}
