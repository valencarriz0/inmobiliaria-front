type GalleryProperty = { images: string[]; title: string };

export default function PropertyGallery({ property }: { property: GalleryProperty }) {
  const [cover, ...otherImages] = property.images;
  return (
    <div className="flex items-stretch gap-4">
      <div className="w-2/3 h-80 overflow-hidden rounded-xl bg-muted">
        {cover ? <img src={cover} alt={`${property.title} — principal`} className="object-cover w-full h-full" /> : <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin imagen disponible</p>}
      </div>
      <div className="w-1/3 grid grid-cols-1 gap-4 h-80 overflow-y-auto">
        {otherImages.map((url, index) => (
          <div key={`${index}-${url}`} className="min-h-32 overflow-hidden rounded-xl bg-muted">
            <img src={url} alt={`${property.title} — imagen ${index + 2}`} className="object-cover w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
