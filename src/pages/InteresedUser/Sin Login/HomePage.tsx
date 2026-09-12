import Header from "../../../components/Header";
import PropertyCatalog from "../../../components/PropertyCatalog";

export default function HomePageWireframe() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header page={"/post"} />

      {/* Main */}
      <main className="container mx-auto py-12 px-4">
        <PropertyCatalog />
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
