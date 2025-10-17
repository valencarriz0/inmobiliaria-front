import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const SearchBarPublisher = () => {
  const [ubicacion, setUbicacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [moneda, setMoneda] = useState("ARS");

  const handleSearch = () => {
    if (!ubicacion.trim() && !categoria && !tipo && !precioMax.trim()) {
      alert("Por favor, completa al menos un campo de búsqueda.");
      return;
    }

    if (precioMax && (isNaN(Number(precioMax)) || Number(precioMax) <= 0)) {
      alert("El precio máximo debe ser un número positivo.");
      return;
    }

    const filtros = {
      ubicacion: ubicacion || null,
      categoria: categoria || null,
      tipo: tipo || null,
      precioMax: precioMax || null,
      moneda,
    };

    console.log("Buscando propiedades (publisher) con filtros:", filtros);
    alert("Búsqueda realizada correctamente ✅");
  };

  return (
    <div className="max-w-8xl mx-auto mb-16 p-6 border rounded-lg shadow-lg bg-white">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {/* Ubicación */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ubicación"
            className="pl-10 h-10"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="venta">Venta</SelectItem>
            <SelectItem value="alquiler">Alquiler</SelectItem>
          </SelectContent>
        </Select>

        {/* Tipo de propiedad */}
        <Select value={tipo} onValueChange={setTipo}>
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
        <Select value={""} onValueChange={() => {}}>
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
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
          <Select value={moneda} onValueChange={setMoneda}>
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
        <Button
          className="h-10 bg-accent hover:bg-accent/90"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default SearchBarPublisher;
