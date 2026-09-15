import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { mockPublisherNotifications } from "../data/mock/activity";
import { MOCK_CURRENT_PUBLISHER_ID } from "../data/mock/session";
import { useUserPreview } from "../hooks/use-user-preview";
import { formatDate } from "../lib/formatters";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function NotificationsMenu() {
  const { user } = useUserPreview();
  const notifications = user?.role === "publisher"
    ? mockPublisherNotifications.filter((notification) => notification.publisherId === MOCK_CURRENT_PUBLISHER_ID) : [];

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="relative" aria-label={`Notificaciones${notifications.length ? `: ${notifications.length}` : ""}`}>
        <Bell className="h-5 w-5 text-muted-foreground" />
        {notifications.length > 0 && <Badge aria-hidden="true" className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[10px] bg-accent text-white">{notifications.length}</Badge>}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
      <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {notifications.length ? <>
        <p className="px-2 py-1 text-xs text-muted-foreground">Notificaciones de ejemplo.</p>
        {notifications.map((notification) => <DropdownMenuItem asChild key={notification.id}>
          <Link to={notification.to} className="flex flex-col items-start gap-1 whitespace-normal py-3">
            <span>{notification.title}</span>
            <time dateTime={notification.createdAt} className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</time>
          </Link>
        </DropdownMenuItem>)}
      </> : <p className="p-3 text-sm text-muted-foreground">No hay notificaciones para mostrar en esta vista previa.</p>}
    </DropdownMenuContent>
  </DropdownMenu>;
}
