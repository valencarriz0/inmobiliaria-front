import type { ComponentProps } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { FieldError } from "./field-error";
import { cn } from "../../lib/utils";

type InputFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  errorId: string;
};

function InputField({ label, error, errorId, className, id, ...props }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={error ? "text-destructive" : undefined}>
        {label}{props.required && <span aria-hidden="true">*</span>}
      </Label>
      <Input
        {...props}
        id={id}
        className={cn("bg-white dark:bg-input/30", className)}
        aria-invalid={Boolean(error)}
        aria-describedby={[...new Set([props["aria-describedby"], error ? errorId : undefined].filter(Boolean))].join(" ") || undefined}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export { InputField };
