import { Search } from "lucide-react";
import { useId } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { PublisherFilters } from "../lib/publisher-properties";

export default function SearchBarPublisher({ filters, onChange }: { filters: PublisherFilters; onChange: (filters: PublisherFilters) => void }) {
  const id = useId();
  return (
    <form role="search" aria-label="Buscar mis propiedades" onSubmit={(event) => event.preventDefault()} className="mx-auto mb-8 p-6 border rounded-lg shadow-lg bg-white dark:bg-card">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
        <div className="space-y-2 min-w-0">
          <Label htmlFor={`${id}-query`}>Buscar por título o ubicación</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input id={`${id}-query`} type="search" placeholder="Buscar por título o ubicación" className="pl-10 h-10"
              value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} />
          </div>
        </div>
        <div className="space-y-2 min-w-0">
          <Label htmlFor={`${id}-status`}>Estado</Label>
          <Select value={filters.status} onValueChange={(status) => {
            if (status === "all" || status === "active" || status === "paused") onChange({ ...filters, status });
          }}>
            <SelectTrigger id={`${id}-status`} className="w-full h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
}
