import { Search } from "lucide-react";
import { useId } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type AdminPropertyFilters = { q: string; status: "all" | "active" | "paused" | "deleted"; publisherId: string };

export default function SearchBarAdmin({ filters, publishers, onChange }: { filters: AdminPropertyFilters; publishers: { id: string; name: string }[]; onChange: (filters: AdminPropertyFilters) => void }) {
  const id = useId();
  return <form role="search" aria-label="Buscar publicaciones" onSubmit={(event) => event.preventDefault()} className="mx-auto mb-8 rounded-lg border bg-white p-6 shadow-lg dark:bg-card">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px_220px]">
      <div className="min-w-0 space-y-2"><Label htmlFor={`${id}-query`}>Buscar publicación</Label><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" /><Input id={`${id}-query`} type="search" placeholder="Buscar por título o descripción" className="h-10 pl-10" value={filters.q} onChange={(event) => onChange({ ...filters, q: event.target.value })} /></div></div>
      <div className="min-w-0 space-y-2"><Label htmlFor={`${id}-status`}>Estado</Label><Select value={filters.status} onValueChange={(status) => onChange({ ...filters, status: status as AdminPropertyFilters["status"] })}><SelectTrigger id={`${id}-status`} className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="active">Activas</SelectItem><SelectItem value="paused">Pausadas</SelectItem><SelectItem value="deleted">Eliminadas</SelectItem></SelectContent></Select></div>
      <div className="min-w-0 space-y-2"><Label htmlFor={`${id}-publisher`}>Publicador</Label><Select value={filters.publisherId || "all"} onValueChange={(publisherId) => onChange({ ...filters, publisherId: publisherId === "all" ? "" : publisherId })}><SelectTrigger id={`${id}-publisher`} className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{publishers.map((publisher) => <SelectItem key={publisher.id} value={publisher.id}>{publisher.name}</SelectItem>)}</SelectContent></Select></div>
    </div>
  </form>;
}
