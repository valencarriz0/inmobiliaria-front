// no hooks needed here
import HeaderUser from "../../../components/HeaderUser";
import SearchBar from "../../../components/SearchBar";
import PropertyList from "../../../components/PropertyList";

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
        <SearchBar />
        {/* Historial de propiedades */}
        <h2 className="text-3xl font-bold mb-4 text-center">
          Últimas propiedades que viste
        </h2>
        <PropertyList loggedIn />
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
