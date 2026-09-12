import type { ComponentProps } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "../../lib/utils";

function FieldError({ children, className, ...props }: ComponentProps<"p">) {
  if (!children) return null;

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("mt-1.5 flex items-start gap-1.5 text-sm text-destructive", className)}
      {...props}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export { FieldError };
