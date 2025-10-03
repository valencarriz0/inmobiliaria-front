import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Heart, Search, MapPin, Home, Bell, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link } from "react-router";

export default function HomePageLogin() {
  const [favorites, setFavorites] = useState<number[]>([1]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const viewedProperties = [
    {
      id: 1,
      category: "Departamento",
      title: "Loft moderno en el centro",
      characteristics: "1 hab • 1 baño • 50m²",
      price: "$120,000",
      location: "Centro",
    },
    {
      id: 2,
      category: "Casa",
      title: "Casa con pileta en barrio cerrado",
      characteristics: "4 hab • 3 baños • 250m²",
      price: "$450,000",
      location: "Barrio Norte",
    },
    {
      id: 3,
      category: "Terreno",
      title: "Terreno amplio para inversión",
      characteristics: "Lote de 500m²",
      price: "$95,000",
      location: "Periferia",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary font-[family-name:var(--font-space-grotesk)]">
              Nombre y Logo
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
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Favoritos</DropdownMenuItem>
                <DropdownMenuItem>Historial</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto py-12 px-4">
        {/* Barra de búsqueda */}
        <div className="max-w-6xl mx-auto mb-16 p-6 border rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Ubicación */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Ubicación" className="pl-10 h-10" />
            </div>

            {/* Categoría */}
            <Select>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>

            {/* Tipo de propiedad */}
            <Select>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Tipo de propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="departamento">Departamento</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="local">Local Comercial</SelectItem>
              </SelectContent>
            </Select>

            {/* Precio máximo + moneda */}
            <div className="flex items-center border rounded-md overflow-hidden">
              <Input
                placeholder="Precio máximo"
                className="flex-1 h-10 border-none focus-visible:ring-0"
              />
              <Select defaultValue="USD">
                <SelectTrigger className="w-[80px] h-10 rounded-l-none border-l">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón buscar */}
            <Button className="h-10 bg-accent hover:bg-accent/90">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Historial de propiedades */}
        <h2 className="text-3xl font-bold mb-4 text-center">
          Últimas propiedades que viste
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewedProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                  Imagen
                </div>

                {/* Categoría */}
                <span className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                  {property.category}
                </span>

                {/* Favorito */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background hover:scale-110"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(property.id)
                        ? "fill-red-500 stroke-red-500"
                        : "fill-none stroke-black"
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <CardTitle className="text-lg font-bold mb-1">
                  {property.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {property.characteristics}
                </CardDescription>

                <div className="flex items-center justify-between mt-3 mb-4">
                  <span className="text-2xl font-bold text-accent">
                    {property.price}
                  </span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <Link to={`/detailLogin`}>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Ver detalles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
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
