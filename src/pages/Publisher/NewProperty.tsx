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
import { Plus } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";
import HeaderUser from "../../components/HeaderUser";

export default function NewProperty() {
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title) newErrors.title = "El título es obligatorio.";
    if (!province) newErrors.province = "La provincia es obligatoria.";
    if (!city) newErrors.city = "La localidad es obligatoria.";
    if (!street) newErrors.street = "La calle es obligatoria.";
    if (!propertyType)
      newErrors.propertyType = "El tipo de propiedad es obligatorio.";
    if (!category) newErrors.category = "La categoría es obligatoria.";
    if (!price) newErrors.price = "El precio es obligatorio.";
    else if (isNaN(Number(price)))
      newErrors.price = "El precio debe ser un número.";
    if (!currency) newErrors.currency = "Debe seleccionar una moneda.";
    if (!area) newErrors.area = "La superficie es obligatoria.";
    else if (isNaN(Number(area)))
      newErrors.area = "La superficie debe ser un número.";
    if (!rooms) newErrors.rooms = "Debe indicar la cantidad de ambientes.";
    if (!description) newErrors.description = "La descripción es obligatoria.";
    if (!images[0])
      newErrors.images = "Debe subir al menos una imagen principal.";

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    alert("Propiedad publicada correctamente!");
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Estadísticas"
        menuItem3="Configuración"
      />
      <BotonVolver />

      <div className="container mx-auto py-10 px-4 max-w-6xl bg-gray-50 rounded-lg shadow-md">
        <main className="space-y-8">
          <h1 className="text-3xl font-bold">Publicar nueva propiedad</h1>
          <p className="text-sm text-muted-foreground">
            Los ítems con <span className="text-red-600">*</span> son
            obligatorios
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Título <span className="text-red-600">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  className={`bg-white ${errors.title ? "border-red-500" : ""}`}
                  placeholder="Ejemplo: Casa familiar con jardín"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Provincia */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Provincia <span className="text-red-600">*</span>
                </label>
                <Select
                  value={province}
                  onValueChange={(value) => {
                    setProvince(value);
                    setErrors({ ...errors, province: "" });
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${
                      errors.province ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                    <SelectItem value="Córdoba">Córdoba</SelectItem>
                    <SelectItem value="Mendoza">Mendoza</SelectItem>
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                )}
              </div>

              {/* Localidad */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Localidad <span className="text-red-600">*</span>
                </label>
                <Select
                  value={city}
                  onValueChange={(value) => {
                    setCity(value);
                    setErrors({ ...errors, city: "" });
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${
                      errors.city ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione localidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ciudad 1">Ciudad 1</SelectItem>
                    <SelectItem value="Ciudad 2">Ciudad 2</SelectItem>
                  </SelectContent>
                </Select>
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              {/* Calle */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Calle <span className="text-red-600">*</span>
                </label>
                <Input
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    setErrors({ ...errors, street: "" });
                  }}
                  className={`bg-white ${
                    errors.street ? "border-red-500" : ""
                  }`}
                  placeholder="Ejemplo: Av. Libertador"
                />
                {errors.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                )}
              </div>

              {/* Altura */}
              <div>
                <label className="block text-sm font-medium mb-1">Altura</label>
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-white"
                  placeholder="Ejemplo: 1234"
                />
              </div>

              {/* Tipo de propiedad */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de propiedad <span className="text-red-600">*</span>
                </label>
                <Select
                  value={propertyType}
                  onValueChange={(value) => {
                    setPropertyType(value);
                    setErrors({ ...errors, propertyType: "" });
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${
                      errors.propertyType ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Departamento">Departamento</SelectItem>
                  </SelectContent>
                </Select>
                {errors.propertyType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.propertyType}
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría <span className="text-red-600">*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value);
                    setErrors({ ...errors, category: "" });
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Venta">Venta</SelectItem>
                    <SelectItem value="Alquiler">Alquiler</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio $ <span className="text-red-600">*</span>
                </label>
                <Input
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors({ ...errors, price: "" });
                  }}
                  className={`bg-white ${errors.price ? "border-red-500" : ""}`}
                  placeholder="Ejemplo: 150000"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de moneda <span className="text-red-600">*</span>
                </label>
                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value);
                    setErrors({ ...errors, currency: "" });
                  }}
                >
                  <SelectTrigger
                    className={`bg-white ${
                      errors.currency ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="ARS/USD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
                )}
              </div>

              {/* Superficie */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Superficie en m² <span className="text-red-600">*</span>
                </label>
                <Input
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setErrors({ ...errors, area: "" });
                  }}
                  className={`bg-white ${errors.area ? "border-red-500" : ""}`}
                  placeholder="Ejemplo: 100"
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              {/* Ambientes */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad de ambientes <span className="text-red-600">*</span>
                </label>
                <Input
                  value={rooms}
                  onChange={(e) => {
                    setRooms(e.target.value);
                    setErrors({ ...errors, rooms: "" });
                  }}
                  className={`bg-white ${errors.rooms ? "border-red-500" : ""}`}
                  placeholder="Ejemplo: 3"
                />
                {errors.rooms && (
                  <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripción <span className="text-red-600">*</span>
              </label>
              <Textarea
                placeholder="Ejemplo: Hermosa casa ubicada en zona tranquila..."
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: "" });
                }}
                className={`bg-white ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Imagen principal */}
            <div>
              <p className="text-sm font-medium mb-2">
                Imágenes (mínimo una principal)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`h-48 rounded-lg flex items-center justify-center cursor-pointer border-dashed border-2 ${
                      errors.images && idx === 0
                        ? "border-red-500"
                        : "border-border"
                    }`}
                    onClick={() => {
                      const file = window.prompt(
                        "Ingrese URL de la imagen o seleccione archivo local"
                      );
                      if (file) handleImageChange(idx, new File([], file));
                      setErrors({ ...errors, images: "" });
                    }}
                  >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="ml-2">{`Imagen ${idx + 1}${
                      idx === 0 ? " (principal) *" : ""
                    }`}</span>
                  </div>
                ))}
              </div>
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" type="button">
                Cancelar
              </Button>
              <Button type="submit">Publicar</Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
