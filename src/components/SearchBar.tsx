import { CURRENCIES, OPERATION_TYPES, PROPERTY_TYPES } from "../constants/property";
import { useState, type FormEvent } from "react";
import { FieldError } from "./ui/field-error";
import { useFormValidation } from "../hooks/use-form-validation";
import { validateNumber } from "../lib/validation";
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
  const [moneda, setMoneda] = useState<string>(CURRENCIES[0]);

  const { errors, fieldProps, errorId, validateForm } = useFormValidation(() => ({
    ubicacion: !ubicacion.trim() && !categoria && !tipo && !precioMax.trim()
      ? "Completá al menos un filtro para buscar." : undefined,
    precioMax: validateNumber(precioMax, "El precio máximo", { optional: true, exclusive: true }),
  }));

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) return;

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
    <form noValidate onSubmit={handleSearch} className="max-w-6xl mx-auto mb-16 p-6 border rounded-lg shadow-lg bg-white">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Ubicación */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            {...fieldProps("ubicacion")}
            aria-label="Ubicación"
            placeholder="Ubicación"
            className="pl-10 h-10"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
          <FieldError id={errorId("ubicacion")}>{errors.ubicacion}</FieldError>
        </div>

        {/* Categoría */}
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger aria-label="Categoría" className="w-full h-10">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(OPERATION_TYPES).filter(([value]) => value !== "temporary_rent").map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tipo de propiedad */}
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger aria-label="Tipo de propiedad" className="w-full h-10">
            <SelectValue placeholder="Tipo de propiedad" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Precio máximo + moneda */}
        <div>
          <div className={`flex items-center border rounded-md h-10 ${errors.precioMax ? "border-destructive ring-destructive/20" : ""}`}>
          <Input
            {...fieldProps("precioMax")}
            aria-label="Precio máximo"
            inputMode="decimal"
            placeholder="Precio máximo"
            className="w-full flex-1 border-none focus-visible:ring-0 h-9"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
          <Select value={moneda} onValueChange={setMoneda}>
            <SelectTrigger aria-label="Moneda" className="w-[80px] h-10 rounded-l-none border-l ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          <FieldError id={errorId("precioMax")}>{errors.precioMax}</FieldError>
        </div>

        {/* Botón buscar */}
        <Button
          className="h-10 bg-accent hover:bg-accent/90"
          type="submit"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
