import * as React from "react";

import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const findLabel = (): HTMLElement | null => {
      const prev = el.previousElementSibling as HTMLElement | null;
      if (prev && prev.tagName.toLowerCase() === "label") return prev;

      const id = el.id;
      if (id) {
        const byFor = document.querySelector(
          `label[for=\"${id}\"]`
        ) as HTMLElement | null;
        if (byFor) return byFor;

        const bySlot = document.querySelector(
          `[data-slot=\"label\"][for=\"${id}\"]`
        ) as HTMLElement | null;
        if (bySlot) return bySlot;
      }

      const ancestor = el.closest("label") as HTMLElement | null;
      if (ancestor) return ancestor;

      return null;
    };

    const label = findLabel();

    const update = () => {
      if (!label) return;
      try {
        const valid = el.checkValidity();
        if (!valid && (el.value !== "" || el === document.activeElement)) {
          label.classList.add("text-destructive");
        } else {
          label.classList.remove("text-destructive");
        }
      } catch (e) {
        // no-op
      }
    };

    el.addEventListener("input", update);
    el.addEventListener("blur", update);

    update();

    return () => {
      el.removeEventListener("input", update);
      el.removeEventListener("blur", update);
    };
  }, []);

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
