import { Heart, Home, User, UsersRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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

export default function HeaderUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const home = roleHome(user.role);

  const links = [
    { label: "Perfil", to: "/profile" },
    { label: "Catálogo", to: "/HomePageLogin" },

    ...(canUseInterestedFeatures(user)
      ? [
          { label: "Favoritos", to: "/favorites" },
          { label: "Mis consultas", to: "/consultations" },
          { label: "Propiedades vistas", to: "/view-history" },
          { label: "Mis alertas", to: "/search-alerts" },
        ]
      : []),

    ...(user.role === "publisher"
      ? [
          { label: "Mis propiedades", to: "/dashboard" },
          { label: "Publicar nueva propiedad", to: "/newProperty" },
          { label: "Estadísticas", to: "/statistics" },
          {
            label: "Consultas recibidas",
            to: "/publisher/consultations",
          },
        ]
      : user.role === "admin"
        ? []
        : [
            {
              label: "Quiero publicar propiedades",
              to: "/become-publisher",
            },
          ]),
  ];

  return (
    <header className="sticky top-0 z-50 isolate w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2">
        <Link to={home} className="flex items-center gap-1 sm:gap-2">
          <Home className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          <span className="text-base font-bold text-primary sm:text-xl">
            InmuConnect
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {canUseInterestedFeatures(user) && (
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

              {links.map(({ label, to }) => (
                <DropdownMenuItem key={label} asChild>
                  <Link to={to}>{label}</Link>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}