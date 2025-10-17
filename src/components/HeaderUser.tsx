import React from "react";
import { Bell, Home, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderUserProps {
  menuItem1: React.ReactNode;
  menuItem2: React.ReactNode;
  menuItem3: React.ReactNode;
}

const HeaderUser: React.FC<HeaderUserProps> = ({
  menuItem1,
  menuItem2,
  menuItem3,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo y nombre */}
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary font-[family-name:var(--font-space-grotesk)]">
            InmuConnect
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Menú usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{menuItem1}</DropdownMenuItem>
              <DropdownMenuItem>{menuItem2}</DropdownMenuItem>
              <DropdownMenuItem>{menuItem3}</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                {"Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default HeaderUser;
