import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { AdminMetrics, AdminProperty, AdminUser } from "../../types/admin";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

function message(error: unknown) { return error instanceof Error ? error.message : "No se pudo cargar la información."; }

export function AdminMetricsSection() {
  const [metrics, setMetrics] = useState<AdminMetrics>(); const [error, setError] = useState("");
  useEffect(() => { void adminService.metrics().then(setMetrics).catch((reason) => setError(message(reason))); }, []);
  if (error) return <p role="alert">{error}</p>; if (!metrics) return <p role="status">Cargando métricas...</p>;
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{[["Usuarios interesados", metrics.registeredUsers], ["Publicadores", metrics.publishers], ["Publicaciones activas", metrics.activeProperties], ["Publicaciones pausadas", metrics.pausedProperties], ["Visualizaciones", metrics.totalViews], ["Consultas", metrics.totalConsultations]].map(([label, value]) => <Card key={String(label)}><CardContent className="py-5"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></CardContent></Card>)}</div>;
}

export function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]); const [q, setQ] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { setUsers((await adminService.users({ q: q || undefined, page: "1", limit: "20" })).users); setError(""); } catch (reason) { setError(message(reason)); } finally { setLoading(false); } }, [q]);
  useEffect(() => { void load(); }, [load]);
  const toggle = async (user: AdminUser) => { try { const result = user.accountStatus === "active" ? await adminService.disableUser(user.id) : await adminService.reactivateUser(user.id); setUsers((items) => items.map((item) => item.id === user.id ? result.user : item)); } catch (reason) { setError(message(reason)); } };
  return <section className="space-y-4"><form onSubmit={(event) => { event.preventDefault(); void load(); }} className="flex gap-2"><input aria-label="Buscar usuarios" className="rounded border px-3" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar usuario"/><Button>Buscar</Button></form>{loading ? <p role="status">Cargando usuarios...</p> : error ? <p role="alert">{error}</p> : users.length === 0 ? <p>No hay usuarios que coincidan con los filtros.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th scope="col">Usuario</th><th scope="col">Rol</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t"><td className="p-2">{user.firstName} {user.lastName}<br/><span className="text-muted-foreground">{user.email}</span></td><td>{user.role}</td><td>{user.accountStatus}</td><td><Button variant="outline" onClick={() => void toggle(user)}>{user.accountStatus === "active" ? "Deshabilitar" : "Reactivar"}</Button></td></tr>)}</tbody></table></div>}</section>;
}

export function AdminPropertiesSection() {
  const [properties, setProperties] = useState<AdminProperty[]>([]); const [error, setError] = useState("");
  useEffect(() => { void adminService.properties({ page: "1", limit: "20" }).then((result) => setProperties(result.properties)).catch((reason) => setError(message(reason))); }, []);
  if (error) return <p role="alert">{error}</p>; if (!properties.length) return <p role="status">Cargando publicaciones...</p>;
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th scope="col">Publicación</th><th scope="col">Precio</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead><tbody>{properties.map((property) => <tr key={property.id} className="border-t"><td className="p-2">{property.title}</td><td>{property.currency} {property.price}</td><td>{property.publicationStatus}</td><td><Button variant="outline" onClick={() => void (property.publicationStatus === "active" ? adminService.pauseProperty(property.id) : property.publicationStatus === "paused" ? adminService.reactivateProperty(property.id) : adminService.deleteProperty(property.id))}>{property.publicationStatus === "active" ? "Pausar" : property.publicationStatus === "paused" ? "Reactivar" : "Eliminar"}</Button></td></tr>)}</tbody></table></div>;
}
