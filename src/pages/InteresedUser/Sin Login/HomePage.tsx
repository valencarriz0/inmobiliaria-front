import Header from "../../../components/Header";
import SearchBar from "../../../components/SearchBar";
import PropertyList from "../../../components/PropertyList";

export default function HomePageWireframe() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header page={"/post"} />

      {/* Main */}
      <main className="container mx-auto py-12 px-4">
        <SearchBar />

        {/* Propiedades destacadas */}
        <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-grotesk)] text-center">
          Propiedades destacadas
        </h2>

        <PropertyList />
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
