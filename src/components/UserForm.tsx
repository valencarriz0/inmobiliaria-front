import { useState, type ComponentProps, type FormEvent } from "react";
import { useFormValidation } from "../hooks/use-form-validation";
import { createUserFormValues, validateUserForm } from "../lib/user-form";
import type { AuthUser, UserFormValues, UserRole } from "../types/user";
import { Button } from "./ui/button";
import { InputField } from "./ui/input-field";
import { Label } from "./ui/label";
import { FieldError } from "./ui/field-error";
import GuidedFormSteps from "./GuidedFormSteps";

interface UserFormProps {
  role: UserRole;
  initialUser?: AuthUser;
  withPassword?: boolean;
  readOnlyEmail?: boolean;
  publisherFields?: boolean;
  submitLabel: string;
  onSubmit: (values: UserFormValues) => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  formError?: string;
  serverErrors?: Partial<Record<keyof UserFormValues, string>>;
  guided?: boolean;
}

const registrationSteps = [
  { title: "Tus datos", description: "Información personal" },
  { title: "Tu cuenta", description: "Correo y contraseña" },
] as const;

export default function UserForm({ role, initialUser, withPassword = false, readOnlyEmail = false, publisherFields = false, submitLabel, onSubmit, onCancel, isSubmitting = false, formError, serverErrors = {}, guided = false }: UserFormProps) {
  const [values, setValues] = useState(() => createUserFormValues(initialUser));
  const [step, setStep] = useState(0);
  const { errors, fieldProps, errorId, validateForm, touch } = useFormValidation(() => validateUserForm(values, role, withPassword, publisherFields));
  const publisher = publisherFields;
  const agency = publisher && values.publisherType === "agency";

  function input(field: keyof UserFormValues, label: string, options: ComponentProps<"input"> = {}) {
    return <InputField
      {...fieldProps(field)} label={label} required value={values[field]}
      onChange={(event) => setValues({ ...values, [field]: event.target.value })}
      {...options} disabled={isSubmitting || options.disabled} error={errors[field] ?? serverErrors[field]} errorId={errorId(field)}
    />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guided && step === 0) {
      const errors = validateUserForm(values, role, withPassword, publisherFields);
      const fields: (keyof UserFormValues)[] = ["firstName", "lastName", "phone"];
      fields.forEach((field) => touch(field));
      const firstInvalid = fields.find((field) => errors[field]);
      if (firstInvalid) {
        const form = event.currentTarget;
        requestAnimationFrame(() => form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus());
        return;
      }
      setStep(1);
      return;
    }
    if (!validateForm(event.currentTarget)) return;
    const submittedValues = { ...values, email: readOnlyEmail && initialUser ? initialUser.email : values.email };
    const succeeded = await onSubmit(submittedValues);
    if (succeeded !== false) setValues((previous) => ({ ...previous, password: "", passwordConfirm: "" }));
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-6">
      {guided && <GuidedFormSteps steps={registrationSteps} activeStep={step} onSelect={setStep} />}
      <p className="text-sm text-muted-foreground">Los campos con * son obligatorios.</p>
      {publisher && (
        <fieldset className="min-w-0 space-y-3">
          <legend className="text-sm font-medium">Tipo de publicador <span aria-hidden="true">*</span></legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([["individual", "Propietario particular"], ["agency", "Inmobiliaria"]] as const).map(([value, label]) => (
              <Label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${values.publisherType === value ? "border-primary bg-tertiary text-tertiary-foreground" : "bg-background dark:bg-input/30"}`}>
                <input {...fieldProps("publisherType")} id={`${fieldProps("publisherType").id}-${value}`}
                  type="radio" required value={value} checked={values.publisherType === value} className="accent-accent"
                  onChange={() => setValues({ ...values, publisherType: value, agencyName: value === "individual" ? "" : values.agencyName })} />
                {label}
              </Label>
            ))}
          </div>
          <FieldError id={errorId("publisherType")}>{errors.publisherType}</FieldError>
        </fieldset>
      )}
      {(!guided || step === 0) && <div className="grid grid-cols-1 gap-4">
        {input("firstName", agency ? "Nombre de la persona responsable" : "Nombre", { autoComplete: "given-name" })}
        {input("lastName", agency ? "Apellido de la persona responsable" : "Apellido", { autoComplete: "family-name" })}
      </div>}
      {guided && step === 0 && input("phone", "WhatsApp / teléfono (opcional)", { type: "tel", autoComplete: "tel", required: false })}
      {guided && step === 1 && <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
        <div><h2 className="text-lg font-semibold">Creá tus datos de acceso</h2><p className="text-sm text-muted-foreground">Usá un correo al que tengas acceso para verificar tu cuenta.</p></div>
        {input("email", "Correo electrónico", { type: "email", autoComplete: "email" })}
        {withPassword && <div className="grid gap-4 sm:grid-cols-2">
          {input("password", "Contraseña", { type: "password", autoComplete: "new-password", placeholder: "Al menos 6 caracteres" })}
          {input("passwordConfirm", "Repetir contraseña", { type: "password", autoComplete: "new-password" })}
        </div>}
      </div>}
      {!guided && <>
      {agency && input("agencyName", "Nombre / Razón social de la inmobiliaria", { autoComplete: "organization" })}
      {input("email", "Correo electrónico", { type: "email", autoComplete: "email", readOnly: readOnlyEmail })}
      {readOnlyEmail && <p className="text-xs text-muted-foreground">El correo de tu cuenta no se modifica desde este formulario.</p>}
      {input("phone", publisher ? "WhatsApp / teléfono" : "WhatsApp / teléfono (opcional)", { type: "tel", autoComplete: "tel", required: publisher })}
      {publisher && input("taxId", agency ? "CUIT fiscal con el que opera la inmobiliaria" : "CUIT/CUIL del propietario", { inputMode: "numeric", placeholder: "20-12345678-9" })}
      {withPassword && <div className="space-y-4">
        {input("password", "Contraseña", { type: "password", autoComplete: "new-password", placeholder: "Al menos 6 caracteres" })}
        {input("passwordConfirm", "Repetir contraseña", { type: "password", autoComplete: "new-password" })}
      </div>}
      </>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {guided && step === 1 ? <Button type="button" variant="outline" onClick={() => setStep(0)}>Volver al paso anterior</Button> : onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? "Procesando..." : guided && step === 0 ? "Continuar" : submitLabel}</Button>
      </div>
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
    </form>
  );
}
