import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import HeaderUser from "../../components/HeaderUser";

import { MapPin } from "lucide-react";

import { Link } from "react-router";

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  views: number;
  inquiries: number;
  status: "Activa" | "Pausada" | "Vendida";
  image: string;
}

export default function PublisherDashboard() {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 1,
      title: "Departamento en Palermo",
      location: "Buenos Aires, Argentina",
      price: "USD 120,000",
      views: 120,
      inquiries: 5,
      status: "Activa",
      image: "https://via.placeholder.com/80",
    },
    {
      id: 2,
      title: "Casa en las afueras",
      location: "Córdoba, Argentina",
      price: "USD 85,000",
      views: 75,
      inquiries: 2,
      status: "Pausada",
      image: "https://via.placeholder.com/80",
    },
  ]);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const toggleStatus = (id: number) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Activa" ? "Pausada" : "Activa" }
          : p
      )
    );
  };

  const deleteProperty = () => {
    if (deleteId !== null) {
      setProperties((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Estadísticas"
        menuItem3="Configuración"
      />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Tabs navegación */}
        <div className="max-w-8xl mx-auto mb-16 p-6 border rounded-lg shadow-lg bg-white">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
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

            {/* Estado */}
            <Select>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activa">Activas</SelectItem>
                <SelectItem value="pausada">Pausadas</SelectItem>
                <SelectItem value="vendida">Vendidas/Alquiladas</SelectItem>
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

        {/* Encabezado sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Mis Propiedades</h2>
          <Link to="/newProperty">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Publicar Nueva Propiedad
            </Button>
          </Link>
        </div>

        {/* Listado de propiedades (tabla simple) */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Imagen</th>
                <th className="p-3">Título</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Visitas</th>
                <th className="p-3">Consultas</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.location}</td>
                  <td className="p-3">{p.price}</td>
                  <td className="p-3">{p.views}</td>
                  <td className="p-3">{p.inquiries}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-right">
                    <Link to={`/detailPublisher`}>
                      <Button variant="outline" size="sm">
                        Ver Más
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
