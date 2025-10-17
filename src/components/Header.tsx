import React from "react";
import { Home } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import AuthModals from "./Modals/AuthModals";

interface HeaderProps {
  page: string;
}

const Header: React.FC<HeaderProps> = ({ page }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary font-[family-name:var(--font-space-grotesk)]">
            InmuConnect
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={page}>
            <Button variant="outline" size="sm">
              Publicar
            </Button>
          </Link>
          <AuthModals />
        </div>
      </div>
    </header>
  );
};

export default Header;
