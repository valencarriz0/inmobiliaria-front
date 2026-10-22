import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Mail, MoreVertical, Pencil, Phone, UserCheck, UserX, UsersRound } from "lucide-react";
import { CardListSkeleton } from "../../components/LoadingSkeletons";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { FieldError } from "../../components/ui/field-error";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { adminService } from "../../services/adminService";
import type { AdminUser } from "../../types/admin";

export { AdminMetricsSection } from "./AdminMetricCards";

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "No se pudo completar la operación.";
const roleLabels: Record<AdminUser["role"], string> = { interested: "Interesado", publisher: "Publicador" };
const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" });

function initials(user: AdminUser) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

export function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers((await adminService.users({ page: "1", limit: "20" })).users);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openEditor = (user: AdminUser) => {
    setEditError("");
    setEditing({ ...user });
  };

  const save = async () => {
    if (!editing || savingUserId) return;
    setSavingUserId(editing.id);
    setEditError("");
    try {
      const result = await adminService.updateUser(editing.id, {
        firstName: editing.firstName,
        lastName: editing.lastName,
        phone: editing.phone,
      });
      setUsers((items) => items.map((item) => item.id === result.user.id ? result.user : item));
      setEditing(null);
    } catch (reason) {
      setEditError(errorMessage(reason));
    } finally {
      setSavingUserId(null);
    }
  };

  const changeStatus = async (user: AdminUser) => {
    if (savingUserId) return;
    setSavingUserId(user.id);
    setError("");
    try {
      const result = user.accountStatus === "active"
        ? await adminService.disableUser(user.id)
        : await adminService.reactivateUser(user.id);
      setUsers((items) => items.map((item) => item.id === result.user.id ? result.user : item));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSavingUserId(null);
    }
  };

  return <section className="admin-management-panel admin-users-panel" aria-labelledby="admin-users-title">
    <div className="publisher-panel-heading admin-section-heading">
      <div><h2 id="admin-users-title">Gestión de cuentas</h2><p>Usuarios interesados y publicadores registrados</p></div>
    </div>

    {error && <div className="publisher-empty-state publisher-consultation-error" role="alert"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Reintentar</Button></div>}
    {loading ? <CardListSkeleton label="Cargando usuarios..." variant="listings" count={4} /> : !error && users.length === 0 ? (
      <div className="publisher-empty-state" role="status"><UsersRound size={22} /><span>No hay usuarios para mostrar.</span></div>
    ) : !error && <div className="publisher-listing-list admin-user-list">
      {users.map((user) => <article className="publisher-listing-card admin-user-card" key={user.id}>
        <span className="publisher-avatar admin-user-avatar" aria-hidden="true">{initials(user)}</span>
        <div className="publisher-listing-copy admin-user-copy">
          <strong>{user.firstName} {user.lastName}</strong>
          <div className="admin-user-details">
            <span><Mail size={14} aria-hidden="true" />{user.email}</span>
            <span><Phone size={14} aria-hidden="true" />{user.phone || "Sin teléfono"}</span>
            <span><CalendarDays size={14} aria-hidden="true" />Desde {dateFormat.format(new Date(user.createdAt))}</span>
          </div>
        </div>
        <div className="publisher-listing-meta admin-user-meta">
          <span className={`publisher-operation-badge admin-role-badge is-${user.role}`}>{roleLabels[user.role]}</span>
          <span className={`publisher-status ${user.accountStatus === "active" ? "is-active" : "is-disabled"}`}>{user.accountStatus === "active" ? "Activo" : "Deshabilitado"}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><button className="publisher-listing-menu-trigger" type="button" aria-label={`Acciones para ${user.firstName} ${user.lastName}`} disabled={savingUserId === user.id}><MoreVertical size={19} aria-hidden="true" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => openEditor(user)}><Pencil />Editar datos</DropdownMenuItem>
              <DropdownMenuItem variant={user.accountStatus === "active" ? "destructive" : "default"} onSelect={() => void changeStatus(user)}>
                {user.accountStatus === "active" ? <><UserX />Deshabilitar</> : <><UserCheck />Reactivar</>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>)}
    </div>}

    <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open && !savingUserId) setEditing(null); }}>
      <DialogContent className="admin-user-dialog">
        <DialogHeader><DialogTitle>Editar usuario</DialogTitle><DialogDescription>Actualizá los datos personales de la cuenta.</DialogDescription></DialogHeader>
        {editing && <form className="admin-user-form" onSubmit={(event) => { event.preventDefault(); void save(); }}>
          <div><Label htmlFor="admin-user-first-name">Nombre</Label><Input id="admin-user-first-name" value={editing.firstName} onChange={(event) => setEditing({ ...editing, firstName: event.target.value })} disabled={Boolean(savingUserId)} /></div>
          <div><Label htmlFor="admin-user-last-name">Apellido</Label><Input id="admin-user-last-name" value={editing.lastName} onChange={(event) => setEditing({ ...editing, lastName: event.target.value })} disabled={Boolean(savingUserId)} /></div>
          <div><Label htmlFor="admin-user-phone">Teléfono</Label><Input id="admin-user-phone" value={editing.phone ?? ""} onChange={(event) => setEditing({ ...editing, phone: event.target.value || null })} disabled={Boolean(savingUserId)} /></div>
          <FieldError>{editError}</FieldError>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={Boolean(savingUserId)}>Cancelar</Button><Button type="submit" disabled={Boolean(savingUserId)}>{savingUserId ? "Guardando..." : "Guardar cambios"}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>
  </section>;
}
