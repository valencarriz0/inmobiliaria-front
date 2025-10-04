import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Heart, Search, MapPin, Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Link } from "react-router";
import AuthModals from "../../components/Modals/AuthModals";
import Header from "../../components/Header";

export default function HomePageWireframe() {
  const featuredProperties = [
    {
      id: 1,
      category: "Departamento",
      title: "Amplio Departamento Céntrico",
      characteristics: "2 hab • 1 baño • 75m²",
      price: "$150,000",
      location: "Centro",
    },
    {
      id: 2,
      category: "Casa",
      title: "Casa Familiar con Jardín",
      characteristics: "3 hab • 2 baños • 180m²",
      price: "$320,000",
      location: "Barrio Cerrado",
    },
    {
      id: 3,
      category: "Terreno",
      title: "Terreno Ideal para Inversión",
      characteristics: "Lote de 300m²",
      price: "$80,000",
      location: "Periferia",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header page={"/post"} />

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
            <div className="flex items-center border rounded-md overflow-hidden h-9.5">
              <Input
                placeholder="Precio máximo"
                className="w-full flex-1 border-none focus-visible:ring-0 h-9"
              />
              <Select defaultValue="ARS">
                <SelectTrigger className="w-[80px] h-10 rounded-l-none border-l ">
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

        {/* Propiedades destacadas */}
        <h2 className="text-3xl font-bold mb-4 font-[family-name:var(--font-grotesk)] text-center">
          Propiedades destacadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
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
                  className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background hover:scale-110"
                >
                  <Heart className="h-5 w-5 fill-none stroke-black" />
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
                <Link to={`/detail`}>
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
