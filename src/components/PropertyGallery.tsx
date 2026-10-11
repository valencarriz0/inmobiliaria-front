import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

type GalleryProperty = { images: string[]; title: string };

export default function PropertyGallery({ property }: { property: GalleryProperty }) {
  const [cover, ...otherImages] = property.images;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage = selectedIndex === null ? undefined : property.images[selectedIndex];
  const activeIndex = selectedIndex ?? 0;
  const hasMultipleImages = property.images.length > 1;
  const moveImage = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (current === null || property.images.length === 0) return current;
      return (current + direction + property.images.length) % property.images.length;
    });
  };

  return (
    <>
      <div className="flex items-stretch gap-4">
        <div className="h-80 w-2/3 overflow-hidden rounded-xl bg-muted">
          {cover ? (
            <button type="button" onClick={() => setSelectedIndex(0)} className="block h-full w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={`Ampliar imagen principal de ${property.title}`}>
              <img src={cover} alt={`${property.title} — principal`} className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
            </button>
          ) : <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin imagen disponible</p>}
        </div>
        <div className="grid h-80 w-1/3 grid-cols-1 gap-4 overflow-y-auto">
          {otherImages.map((url, index) => (
            <button key={`${index}-${url}`} type="button" onClick={() => setSelectedIndex(index + 1)} className="min-h-32 cursor-pointer overflow-hidden rounded-xl bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={`Ampliar imagen ${index + 2} de ${property.title}`}>
              <img src={url} alt={`${property.title} — imagen ${index + 2}`} className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        {selectedImage && (
          <DialogContent
            showCloseButton={false}
            overlayClassName="bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60"
            className="fixed inset-0 z-50 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 rounded-none border-0 bg-transparent p-3 shadow-none sm:max-w-none sm:p-6"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" && hasMultipleImages) {
                event.preventDefault();
                moveImage(-1);
              }
              if (event.key === "ArrowRight" && hasMultipleImages) {
                event.preventDefault();
                moveImage(1);
              }
            }}
          >
            <DialogTitle className="sr-only">Galería de imágenes de {property.title}</DialogTitle>
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-6">
              <DialogClose asChild>
                <button type="button" className="flex cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Cerrar galería">
                  <X className="size-4" aria-hidden="true" />
                  <span>Cerrar</span>
                </button>
              </DialogClose>
              <p aria-live="polite" className="rounded-full border border-border/80 bg-background/80 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur-md">{activeIndex + 1} / {property.images.length}</p>
            </div>

            <img src={selectedImage} alt={`${property.title} — imagen ampliada ${activeIndex + 1}`} className="max-h-[calc(100dvh-7rem)] max-w-full select-none object-contain" />

            {hasMultipleImages && <>
              <button type="button" onClick={() => moveImage(-1)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border/80 bg-background/80 text-foreground shadow-md backdrop-blur-md transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-6" aria-label="Ver imagen anterior">
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => moveImage(1)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border/80 bg-background/80 text-foreground shadow-md backdrop-blur-md transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6" aria-label="Ver imagen siguiente">
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
