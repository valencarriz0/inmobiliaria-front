import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import AuthModals from "./Modals/AuthModals";
import HeaderUser from "./HeaderUser";
import { useAuth } from "../hooks/use-auth";

export default function Header({ page }: { page: string }) {
  const { user } = useAuth();
  if (user) return <HeaderUser />;

  return (
    <header className="sticky top-0 z-50 isolate w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <span className="font-bold text-base sm:text-xl text-primary">InmuConnect</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="px-2 text-xs sm:px-3 sm:text-sm"><Link to={page}>Publicar</Link></Button>
          <AuthModals />
        </div>
      </div>
    </header>
  );
}
