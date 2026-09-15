import Header from "../../../components/Header";
import PropertyCatalog from "../../../components/PropertyCatalog";
import { useAuth } from "../../../hooks/use-auth";

export default function HomePageWireframe() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Header page={"/post"} />

      <main className="container mx-auto py-12 px-4">
        <PropertyCatalog loggedIn={Boolean(user)} />
      </main>

      <footer className="bg-muted py-8 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
