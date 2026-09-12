import { Plus } from "lucide-react";
import type { ComponentProps } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FieldError } from "./ui/field-error";
import { cn } from "../lib/utils";

type PropertyImagesProps = {
  images: (File | null)[];
  onChange: (index: number, file: File | null) => void;
  fieldProps: ComponentProps<"input"> & { id: string };
  error?: string;
  errorId: string;
  minimum: number;
};

export default function PropertyImages({ images, onChange, fieldProps, error, errorId, minimum }: PropertyImagesProps) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">
        Imágenes <span className="text-destructive">*</span> — mínimo {minimum} y máximo 3
      </p>
      <p id={`${fieldProps.id}-help`} className="text-sm text-muted-foreground mb-3">
        JPG, PNG o WebP. Hasta 5 MB por imagen. La primera es la principal.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <Label
            key={index}
            htmlFor={index === 0 ? fieldProps.id : `${fieldProps.id}-${index}`}
            className={cn(
              "relative h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer border-dashed border-2 p-4 focus-within:ring-2 focus-within:ring-ring",
              error ? "border-destructive" : "border-border"
            )}
          >
            <Input
              {...fieldProps}
              id={index === 0 ? fieldProps.id : `${fieldProps.id}-${index}`}
              name={`image-${index}`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label={`Imagen ${index + 1}${index === 0 ? " (principal)" : ""}`}
              aria-required={index === 0}
              aria-describedby={`${fieldProps.id}-help${error ? ` ${errorId}` : ""}`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onChange(index, file);
              }}
            />
            <Plus className="size-6 text-muted-foreground" aria-hidden="true" />
            <span className="text-center break-all leading-normal">
              {img ? img.name : `Imagen ${index + 1}${index === 0 ? " (principal)" : ""}`}
            </span>
          </Label>
        ))}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
