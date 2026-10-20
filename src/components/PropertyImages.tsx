import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps, type DragEvent } from "react";
import { PROPERTY_IMAGE_RULES } from "../constants/property";
import { validateImageSelection } from "../lib/validation";
import type { PropertyFormImage } from "../types/property-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { FieldError } from "./ui/field-error";
import { cn } from "../lib/utils";

type PropertyImagesProps = {
  images: PropertyFormImage[];
  onChange: (images: PropertyFormImage[]) => void;
  onSelectionError: (error: string) => void;
  fieldProps: ComponentProps<"input"> & { id: string };
  error?: string;
  errorId: string;
};

function ImagePreview({ image, index }: { image: PropertyFormImage; index: number }) {
  const preview = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (image.kind !== "new" || !preview.current) return;
    const url = URL.createObjectURL(image.file);
    preview.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [image]);

  return (
    <img
      ref={preview}
      src={image.kind === "existing" ? image.url : undefined}
      alt={`Imagen ${index + 1}${index === 0 ? " (principal)" : ""}`}
      className="h-full w-full object-cover rounded-lg"
    />
  );
}

export default function PropertyImages({ images, onChange, onSelectionError, fieldProps, error, errorId }: PropertyImagesProps) {
  const group = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const helpId = `${fieldProps.id}-help`;
  const describedBy = `${helpId}${error ? ` ${errorId}` : ""}`;

  const changeImages = (nextImages: PropertyFormImage[]) => {
    onChange(nextImages);
    // A removal, or reaching the limit, unmounts the focused control.
    requestAnimationFrame(() => group.current?.focus());
  };

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    const additions: PropertyFormImage[] = files.map((file) => ({ kind: "new", id: crypto.randomUUID(), file }));
    const nextImages = [...images, ...additions];
    const selectionError = validateImageSelection(nextImages);
    if (selectionError) {
      onSelectionError(selectionError);
      return;
    }
    changeImages(nextImages);
    onSelectionError("");
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div ref={group} role="group" aria-labelledby={`${fieldProps.id}-label`} aria-describedby={describedBy} aria-invalid={Boolean(error)} tabIndex={-1} className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring">
      <p id={`${fieldProps.id}-label`} className="text-sm font-medium mb-2">
        Imágenes <span className="text-destructive">*</span> — mínimo {PROPERTY_IMAGE_RULES.min} y máximo {PROPERTY_IMAGE_RULES.max}
      </p>
      <p id={helpId} className="text-sm text-muted-foreground mb-3">
        {PROPERTY_IMAGE_RULES.formatsLabel}. Hasta {PROPERTY_IMAGE_RULES.maxSizeMB} MB por imagen. La primera es la principal.
        {" "}{images.length} de {PROPERTY_IMAGE_RULES.max} seleccionadas.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative h-48 rounded-lg border border-border bg-background">
            <ImagePreview image={image} index={index} />
            <span className="absolute bottom-0 inset-x-0 rounded-b-lg bg-[#171717]/70 p-2 text-sm text-white truncate">
              {index === 0 ? "Principal · " : ""}{image.kind === "new" ? image.file.name : `Imagen ${index + 1}`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="absolute right-2 top-2"
              aria-label={`Eliminar imagen ${index + 1}${index === 0 ? " (principal)" : ""}`}
              onClick={() => changeImages(images.filter((item) => item.id !== image.id))}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ))}
        {images.length < PROPERTY_IMAGE_RULES.max && (
          <Label
            htmlFor={fieldProps.id}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
            onDrop={onDrop}
            className={cn(
              "relative h-48 rounded-xl flex flex-col items-center justify-center cursor-pointer border-dashed border-2 p-4 text-center transition-colors focus-within:ring-2 focus-within:ring-ring",
              error ? "border-destructive" : dragging ? "border-primary bg-tertiary/60" : "border-border hover:border-primary hover:bg-muted/50"
            )}
          >
            <Input
              {...fieldProps}
              type="file"
              multiple
              accept={PROPERTY_IMAGE_RULES.mimeTypes.join(",")}
              className="sr-only"
              aria-label="Agregar imágenes"
              aria-required={images.length < PROPERTY_IMAGE_RULES.min}
              aria-describedby={describedBy}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                addFiles(files);
              }}
            />
            <Plus className="size-6 text-muted-foreground" aria-hidden="true" />
            <span className="mt-2 font-medium">Arrastrá imágenes aquí</span>
            <span className="mt-1 text-sm text-muted-foreground">o hacé clic para seleccionarlas</span>
          </Label>
        )}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
