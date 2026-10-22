import {
  Bell,
  Eye,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
  User,
  UsersRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import NotificationsMenu from "./NotificationsMenu";
import { canUseInterestedFeatures } from "../lib/user-properties";
import { roleHome } from "../lib/auth-navigation";
import "./HeaderUser.css";

const activityLinks = [
  { label: "Mis alertas", to: "/activity?tab=alerts", icon: Bell },
  { label: "Mis consultas", to: "/activity", icon: MessageCircle },
  { label: "Propiedades vistas", to: "/view-history", icon: Eye },
];

export default function HeaderUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;

  const home = roleHome(user.role);
  const hasActivity = canUseInterestedFeatures(user);
  const activityActive = ["/activity", "/consultations", "/search-alerts", "/view-history"].includes(pathname);
  const publisherActive = ["/dashboard", "/newProperty", "/editProperty", "/detailPublisher"].some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <header className="user-header sticky top-0 z-50 isolate w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="user-header-inner container mx-auto">
        <Link to={home} aria-label="InmuConnect" className="user-header-brand flex items-center gap-1 sm:gap-2">
          <Home className="h-5 w-5 shrink-0 text-foreground sm:h-6 sm:w-6" />
          <span className="user-header-brand-name text-base font-bold text-foreground sm:text-xl">
            InmuConnect
          </span>
        </Link>

        <nav className="user-header-navigation" aria-label="Navegación principal">
          <Button asChild variant="ghost" className={`user-header-nav-item ${pathname === "/" ? "is-active" : ""}`}>
            <Link to="/" aria-current={pathname === "/" ? "page" : undefined}>Catálogo</Link>
          </Button>
          {hasActivity && (
            <Button asChild variant="ghost" className={`user-header-nav-item ${activityActive ? "is-active" : ""}`}>
              <Link to="/activity" aria-current={activityActive ? "page" : undefined}>Mi actividad</Link>
            </Button>
          )}
          {user.role === "publisher" && (
            <Button asChild variant="ghost" className={`user-header-nav-item ${publisherActive ? "is-active" : ""}`}>
              <Link to="/dashboard" aria-current={publisherActive ? "page" : undefined}>Panel Publicador</Link>
            </Button>
          )}
          {user.role === "admin" && (
            <Button asChild variant="ghost" className={`user-header-nav-item ${pathname.startsWith("/admin") ? "is-active" : ""}`}>
              <Link to="/admin"><LayoutDashboard aria-hidden="true" />Panel administrador</Link>
            </Button>
          )}
        </nav>

        <div className="user-header-actions">
          {hasActivity && (
            <Button asChild className="user-header-publish rounded-full" size="sm">
              <Link to={user.role === "publisher" ? "/newProperty" : "/become-publisher"}>
                <Plus aria-hidden="true" />Publicar
              </Link>
            </Button>
          )}

          {hasActivity && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              title="Favoritos"
            >
              <Link to="/favorites" aria-label="Favoritos">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
          )}

          {user.role === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Usuarios"
                  title="Usuarios"
                >
                  <UsersRound className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Usuarios</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/admin/users">
                    Administrar usuarios
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/admin/applications">
                    Solicitudes de publicadores
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <NotificationsMenu />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menú de usuario"
              >
                <User className="h-6 w-6 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="max-w-[calc(100vw-2rem)]"
            >
              <DropdownMenuLabel className="max-w-64 truncate">
                {user.firstName} {user.lastName}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link to="/profile"><User aria-hidden="true" />Cuenta</Link>
              </DropdownMenuItem>

              {hasActivity && <>
                <DropdownMenuSeparator />
                {activityLinks.map(({ label, to, icon: Icon }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to}><Icon aria-hidden="true" />{label}</Link>
                  </DropdownMenuItem>
                ))}
              </>}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                <LogOut aria-hidden="true" />Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
