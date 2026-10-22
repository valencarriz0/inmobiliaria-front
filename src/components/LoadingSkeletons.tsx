import { Skeleton, SkeletonStatus } from "./ui/skeleton";

export function PropertyGridSkeleton({ label = "Cargando propiedades...", count = 3 }: { label?: string; count?: number }) {
  return <SkeletonStatus label={label} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }, (_, index) => <div key={index} className="min-h-[31rem] overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm">
      <Skeleton className="h-72 w-full rounded-none border-0" />
      <div className="-mt-8 relative space-y-4 rounded-t-[1.75rem] bg-background px-6 pb-6 pt-8">
        <Skeleton className="h-7 w-4/5" /><Skeleton className="h-4 w-3/5" />
        <div className="flex gap-2"><Skeleton className="h-8 w-20 rounded-full" /><Skeleton className="h-8 w-24 rounded-full" /></div>
        <Skeleton className="mt-16 h-7 w-2/5" />
      </div>
    </div>)}
  </SkeletonStatus>;
}

export function PropertyDetailSkeleton({ label = "Cargando propiedad..." }: { label?: string }) {
  return <SkeletonStatus label={label} className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
    <div className="space-y-6 lg:col-span-2">
      <div className="space-y-3"><Skeleton className="h-9 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>
      <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
      <Skeleton className="h-9 w-1/3" />
      <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-5 w-36" /></div>)}</div>
      <div className="space-y-3"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
    </div>
    <aside className="space-y-5"><Skeleton className="h-64 w-full rounded-xl" /><Skeleton className="h-44 w-full rounded-xl" /></aside>
  </SkeletonStatus>;
}

export function FormSkeleton({ label = "Cargando formulario..." }: { label?: string }) {
  return <SkeletonStatus label={label} className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
    <Skeleton className="h-9 w-56" /><div className="grid gap-5 rounded-xl border border-border p-6 sm:grid-cols-2">{Array.from({ length: 8 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-11 w-full" /></div>)}</div>
  </SkeletonStatus>;
}

export function CardListSkeleton({ label, count = 3, variant = "cards" }: { label: string; count?: number; variant?: "cards" | "listings" | "consultations" | "alerts" }) {
  return <SkeletonStatus label={label} className={`col-span-full w-full ${variant === "cards" || variant === "alerts" || variant === "listings" ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"}`}>
    {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <Skeleton className={variant === "listings" ? "h-28 w-32 shrink-0" : "h-12 w-12 shrink-0 rounded-xl"} />
        <div className="flex-1 space-y-3"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" /></div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      {variant !== "listings" && <div className="mt-5 flex justify-between border-t border-border pt-4"><Skeleton className="h-9 w-36" /><Skeleton className="h-9 w-20" /></div>}
    </div>)}
  </SkeletonStatus>;
}

export function StatisticsSkeleton({ label = "Cargando estadísticas...", count = 4, showChart = true }: { label?: string; count?: number; showChart?: boolean }) {
  return <SkeletonStatus label={label} className="space-y-6">
    <div className={`grid gap-4 sm:grid-cols-2 ${count > 4 ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-4"}`}>{Array.from({ length: count }, (_, index) => <div key={index} className="space-y-4 rounded-2xl border border-border bg-background p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-9 w-1/2" /><Skeleton className="h-4 w-1/3" /></div>)}</div>
    {showChart && <div className="space-y-5 rounded-2xl border border-border bg-background p-6"><Skeleton className="h-6 w-48" /><Skeleton className="h-48 w-full" /></div>}
  </SkeletonStatus>;
}
