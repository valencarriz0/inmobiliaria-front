import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, MapPin } from "lucide-react";

const SearchBar = () => {
  const [ubicacion, setUbicacion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [moneda, setMoneda] = useState("ARS");

  const handleSearch = () => {
    // Validación: si todos los campos están vacíos
    if (!ubicacion.trim() && !categoria && !tipo && !precioMax.trim()) {
      alert("Por favor, completa al menos un campo de búsqueda.");
      return;
    }

    // Validar que el precio sea numérico si fue ingresado
    if (precioMax && (isNaN(Number(precioMax)) || Number(precioMax) <= 0)) {
      alert("El precio máximo debe ser un número positivo.");
      return;
    }

    // Si al menos un campo está completo
    const filtros = {
      ubicacion: ubicacion || null,
      categoria: categoria || null,
      tipo: tipo || null,
      precioMax: precioMax || null,
      moneda,
    };

    console.log("Buscando propiedades con filtros:", filtros);
    alert("Búsqueda realizada correctamente ✅");
  };

  return (
    <div className="max-w-6xl mx-auto mb-16 p-6 border rounded-lg shadow-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

export default SearchBar;
