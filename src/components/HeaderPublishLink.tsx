import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function HeaderPublishLink({ to }: { to: string }) {
  return (
    <Button asChild size="sm" className="px-2 text-xs sm:px-3 sm:text-sm">
      <Link to={to}><Plus aria-hidden="true" />Publicar</Link>
    </Button>
  );
}
