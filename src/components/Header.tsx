import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import AuthModals from "./Modals/AuthModals";
import HeaderPublishLink from "./HeaderPublishLink";
import HeaderUser from "./HeaderUser";
import { useAuth } from "../hooks/use-auth";

export default function Header({ page }: { page: string }) {
  const { user } = useAuth();
  if (user) return <HeaderUser />;

  return (
    <header className="page-gutters sticky top-0 z-50 isolate border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-1 sm:gap-2">
          <Home className="h-5 w-5 shrink-0 text-foreground sm:h-6 sm:w-6" />
          <span className="font-bold text-base sm:text-xl text-foreground">InmuConnect</span>
        </Link>
        <div className="flex items-center gap-2">
          <HeaderPublishLink to={page} />
          <AuthModals triggerVariant="outline" />
        </div>
      </div>
    </header>
  );
}
