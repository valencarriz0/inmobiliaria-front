import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService, type AppNotification } from "../services/notificationService";
import { notificationDestination } from "../lib/notification";
import { useAuth } from "../hooks/use-auth";
import { formatDate } from "../lib/formatters";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function NotificationsMenu() {
  const { user } = useAuth(); const navigate = useNavigate(); const [notifications, setNotifications] = useState<AppNotification[]>([]); const [unreadCount, setUnreadCount] = useState(0); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { if (!user) return; setLoading(true); try { const result = await notificationService.list(); setNotifications(result.notifications); setUnreadCount(result.unreadCount); setError(""); } catch { setError("No se pudieron cargar las notificaciones."); } finally { setLoading(false); } }, [user]);
  useEffect(() => { void load(); }, [load]);
  const open = async (notification: AppNotification) => { if (!notification.readAt) { try { await notificationService.read(notification.id); setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)); setUnreadCount((count) => Math.max(0, count - 1)); } catch { setError("No se pudo actualizar la notificación."); return; } } navigate(notificationDestination(notification)); };
  const readAll = async () => { try { await notificationService.readAll(); setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))); setUnreadCount(0); } catch { setError("No se pudieron actualizar las notificaciones."); } };
  if (!user) return null;
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative" aria-label={`Notificaciones${unreadCount ? `: ${unreadCount} sin leer` : ""}`}><Bell className="h-5 w-5 text-muted-foreground" />{unreadCount > 0 && <Badge aria-hidden="true" className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[10px] bg-accent text-white">{unreadCount}</Badge>}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]"><div className="flex items-center justify-between px-2"><DropdownMenuLabel>Notificaciones</DropdownMenuLabel>{unreadCount > 0 && <Button variant="ghost" size="sm" onClick={() => void readAll()}>Marcar todas</Button>}</div><DropdownMenuSeparator />{loading ? <p role="status" className="p-3 text-sm text-muted-foreground">Cargando...</p> : error ? <div className="p-3 text-sm"><p role="alert">{error}</p><Button variant="link" size="sm" onClick={() => void load()}>Reintentar</Button></div> : notifications.length ? notifications.map((notification) => <DropdownMenuItem key={notification.id} onSelect={(event) => { event.preventDefault(); void open(notification); }} className={`flex flex-col items-start gap-1 whitespace-normal py-3 ${notification.readAt ? "" : "bg-muted/50"}`}><span className="font-medium">{notification.title}</span>{notification.message && <span className="text-xs text-muted-foreground">{notification.message}</span>}<time className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</time></DropdownMenuItem>) : <p className="p-3 text-sm text-muted-foreground">No tenés notificaciones.</p>}</DropdownMenuContent></DropdownMenu>;
}
