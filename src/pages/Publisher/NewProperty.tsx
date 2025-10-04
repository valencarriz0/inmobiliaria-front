import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Home, Bell, User, MapPin, Plus } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";

export default function NewProperty() {
  // Estado del formulario
  const [title, setTitle] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [garages, setGarages] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [images, setImages] = useState<(File | null)[]>([null, null, null]);

  // Validación básica de campos obligatorios
  const handleSubmit = () => {
    if (
      !title ||
      !province ||
      !city ||
      !street ||
      !propertyType ||
      !category ||
      !price ||
      !currency ||
      !area ||
      !rooms ||
      !description ||
      !images[0]
    ) {
      alert("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    alert("Propiedad publicada correctamente!");
  };

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter((s) => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">
              Nombre y Logo
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <BotonVolver />

      {/* Main Form */}
      <main className="container mx-auto py-10 px-4 max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold">Publicar nueva propiedad</h1>
        <p className="text-sm text-muted-foreground">
          Los ítems con <span className="text-red-600">*</span> son obligatorios
        </p>

        <form className="space-y-6">
          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fila 1: Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Título <span className="text-red-600">*</span>
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Fila 2: Provincia y Localidad */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Provincia <span className="text-red-600">*</span>
              </label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                  <SelectItem value="Córdoba">Córdoba</SelectItem>
                  <SelectItem value="Mendoza">Mendoza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Localidad <span className="text-red-600">*</span>
              </label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione localidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ciudad 1">Ciudad 1</SelectItem>
                  <SelectItem value="Ciudad 2">Ciudad 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fila 3: Calle y Altura */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Calle <span className="text-red-600">*</span>
              </label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Altura</label>
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            {/* Fila 4: Tipo de propiedad y Categoría */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de propiedad <span className="text-red-600">*</span>
              </label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Departamento">Departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoría <span className="text-red-600">*</span>
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Venta">Venta</SelectItem>
                  <SelectItem value="Alquiler">Alquiler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fila 5: Precio y Moneda */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio $ <span className="text-red-600">*</span>
              </label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tipo de moneda <span className="text-red-600">*</span>
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="ARS/USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARS">ARS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fila 6: Superficie y Ambientes */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Superficie en m² <span className="text-red-600">*</span>
              </label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cantidad de ambientes <span className="text-red-600">*</span>
              </label>
              <Input value={rooms} onChange={(e) => setRooms(e.target.value)} />
            </div>

            {/* Fila 7: Cocheras y Baños */}
            <div>
              <label className="block text-sm font-medium mb-1">Cocheras</label>
              <Input
                value={garages}
                onChange={(e) => setGarages(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Baños</label>
              <Input
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción <span className="text-red-600">*</span>
            </label>
            <Textarea
              placeholder="Descripción *"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Servicios disponibles (seleccione los que requiera)
            </label>
            <div className="flex gap-4 flex-wrap">
              {["Agua", "Luz", "Gas", "Otro"].map((service) => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={services.includes(service)}
                    onChange={() => toggleService(service)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="h-48 bg-muted rounded-lg flex items-center justify-center cursor-pointer border-dashed border-2 border-border"
                onClick={() => {
                  const file = window.prompt(
                    "Ingrese URL de la imagen o seleccione archivo local"
                  );
                  if (file) handleImageChange(idx, new File([], file));
                }}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="ml-2">{`Imagen ${idx + 1}${
                  idx === 0 ? " (principal) *" : ""
                }`}</span>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => alert("Cancelado")}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Publicar</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
