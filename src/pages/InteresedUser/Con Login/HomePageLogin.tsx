import HeaderUser from "../../../components/HeaderUser";
import PropertyCatalog from "../../../components/PropertyCatalog";

export default function HomePageLogin() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Favoritos"
        menuItem3="Historial"
      />

      {/* Main */}
      <main className="container mx-auto py-12 px-4">
        <PropertyCatalog loggedIn />
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
