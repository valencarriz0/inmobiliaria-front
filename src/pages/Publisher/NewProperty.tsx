import { CURRENCIES, OPERATION_TYPES, PROPERTY_TYPES, PROPERTY_SERVICES } from "../../constants/property";
import { useState, type FormEvent } from "react";
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
import { Label } from "../../components/ui/label";
import { FieldError } from "../../components/ui/field-error";
import PropertyImages from "../../components/PropertyImages";
import { useFormValidation } from "../../hooks/use-form-validation";
import { validateProperty } from "../../lib/validation";
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
  const [currency, setCurrency] = useState<string>(CURRENCIES[0]);
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("");
  const [garages, setGarages] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);

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

  const { errors, fieldProps, errorId, validateForm, touch } = useFormValidation(() =>
    validateProperty({
      title, province, city, street, number, propertyType, category, price,
      currency, area, rooms, bathrooms, garages, description, images,
    }, 2)
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(e.currentTarget)) return;

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
          <h1 className="text-3xl font-bold">
            Publicar nueva propiedad
          </h1>

          <p className="text-sm text-muted-foreground">
            Los ítems con{" "}
            <span className="text-destructive">*</span> son obligatorios
          </p>

          <form noValidate onSubmit={handleSubmit} className="space-y-6">
            {/* Datos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <Label htmlFor={fieldProps("title").id} className="block text-sm font-medium mb-1">
                  Título <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("title")}
                  aria-required={true}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`bg-white ${
                    errors.title ? "border-destructive" : ""
                  }`}
                  placeholder="Ejemplo: Casa familiar con jardín"
                />

                <FieldError id={errorId("title")}>{errors.title}</FieldError>
              </div>

              {/* Provincia */}
              <div>
                <Label htmlFor={fieldProps("province").id} className="block text-sm font-medium mb-1">
                  Provincia <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={province}
                  onValueChange={setProvince}
                >
                  <SelectTrigger
                    {...fieldProps("province")}
                    aria-required
                    className={`bg-white ${
                      errors.province ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione provincia" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Buenos Aires">
                      Buenos Aires
                    </SelectItem>
                    <SelectItem value="Córdoba">Córdoba</SelectItem>
                    <SelectItem value="Mendoza">Mendoza</SelectItem>
                  </SelectContent>
                </Select>

                <FieldError id={errorId("province")}>{errors.province}</FieldError>
              </div>

              {/* Localidad */}
              <div>
                <Label htmlFor={fieldProps("city").id} className="block text-sm font-medium mb-1">
                  Localidad <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={city}
                  onValueChange={setCity}
                >
                  <SelectTrigger
                    {...fieldProps("city")}
                    aria-required
                    className={`bg-white ${
                      errors.city ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione localidad" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Ciudad 1">
                      Ciudad 1
                    </SelectItem>
                    <SelectItem value="Ciudad 2">
                      Ciudad 2
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldError id={errorId("city")}>{errors.city}</FieldError>
              </div>

              {/* Calle */}
              <div>
                <Label htmlFor={fieldProps("street").id} className="block text-sm font-medium mb-1">
                  Calle <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("street")}
                  aria-required={true}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`bg-white ${
                    errors.street ? "border-destructive" : ""
                  }`}
                  placeholder="Ejemplo: Av. Libertador"
                />

                <FieldError id={errorId("street")}>{errors.street}</FieldError>
              </div>

              {/* Altura */}
              <div>
                <Label htmlFor={fieldProps("number").id} className="block text-sm font-medium mb-1">
                  Altura
                </Label>

                <Input
                  {...fieldProps("number")}
                  aria-required={false}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="bg-white"
                  placeholder="Ejemplo: 1234"
                  type="text"
                  inputMode="numeric"
                />
                <FieldError id={errorId("number")}>{errors.number}</FieldError>
              </div>

              {/* Tipo de propiedad */}
              <div>
                <Label htmlFor={fieldProps("propertyType").id} className="block text-sm font-medium mb-1">
                  Tipo de propiedad{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={propertyType}
                  onValueChange={setPropertyType}
                >
                  <SelectTrigger
                    {...fieldProps("propertyType")}
                    aria-required
                    className={`bg-white ${
                      errors.propertyType
                        ? "border-destructive"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(PROPERTY_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError id={errorId("propertyType")}>{errors.propertyType}</FieldError>
              </div>

              {/* Categoría */}
              <div>
                <Label htmlFor={fieldProps("category").id} className="block text-sm font-medium mb-1">
                  Categoría{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger
                    {...fieldProps("category")}
                    aria-required
                    className={`bg-white ${
                      errors.category ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(OPERATION_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError id={errorId("category")}>{errors.category}</FieldError>
              </div>

              {/* Precio */}
              <div>
                <Label htmlFor={fieldProps("price").id} className="block text-sm font-medium mb-1">
                  Precio <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("price")}
                  aria-required={true}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`bg-white ${
                    errors.price ? "border-destructive" : ""
                  }`}
                  placeholder="Ejemplo: 150000"
                  type="text"
                  inputMode="decimal"
                />

                <FieldError id={errorId("price")}>{errors.price}</FieldError>
              </div>

              {/* Moneda */}
              <div>
                <Label htmlFor={fieldProps("currency").id} className="block text-sm font-medium mb-1">
                  Tipo de moneda{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger
                    {...fieldProps("currency")}
                    aria-required
                    className={`bg-white ${
                      errors.currency ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="ARS/USD" />
                  </SelectTrigger>

                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError id={errorId("currency")}>{errors.currency}</FieldError>
              </div>

              {/* Superficie */}
              <div>
                <Label htmlFor={fieldProps("area").id} className="block text-sm font-medium mb-1">
                  Superficie en m²{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("area")}
                  aria-required={true}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={`bg-white ${
                    errors.area ? "border-destructive" : ""
                  }`}
                  placeholder="Ejemplo: 100"
                  type="text"
                  inputMode="decimal"
                />

                <FieldError id={errorId("area")}>{errors.area}</FieldError>
              </div>

              {/* Ambientes */}
              <div>
                <Label htmlFor={fieldProps("rooms").id} className="block text-sm font-medium mb-1">
                  Cantidad de ambientes{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("rooms")}
                  aria-required={true}
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className={`bg-white ${
                    errors.rooms ? "border-destructive" : ""
                  }`}
                  placeholder="Ejemplo: 3"
                  type="text"
                  inputMode="numeric"
                />

                <FieldError id={errorId("rooms")}>{errors.rooms}</FieldError>
              </div>

              {/* Baños */}
              <div>
                <Label htmlFor={fieldProps("bathrooms").id} className="block text-sm font-medium mb-1">
                  Cantidad de baños{" "}
                  <span className="text-destructive">*</span>
                </Label>

                <Input
                  {...fieldProps("bathrooms")}
                  aria-required={true}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className={`bg-white ${
                    errors.bathrooms
                      ? "border-destructive"
                      : ""
                  }`}
                  placeholder="Ejemplo: 2"
                  type="text"
                  inputMode="numeric"
                />

                <FieldError id={errorId("bathrooms")}>{errors.bathrooms}</FieldError>
              </div>

              {/* Cocheras */}
              <div>
                <Label htmlFor={fieldProps("garages").id} className="block text-sm font-medium mb-1">
                  Cantidad de cocheras
                </Label>

                <Input
                  {...fieldProps("garages")}
                  aria-required={false}
                  value={garages}
                  onChange={(e) => setGarages(e.target.value)}
                  className={`bg-white ${
                    errors.garages
                      ? "border-destructive"
                      : ""
                  }`}
                  placeholder="Ejemplo: 1"
                  type="text"
                  inputMode="numeric"
                />

                <FieldError id={errorId("garages")}>{errors.garages}</FieldError>
              </div>
            </div>

            {/* Servicios */}
            <div>
              <p className="text-sm font-medium mb-3">
                Servicios disponibles
              </p>

              <div className="flex flex-wrap gap-6">
                {Object.entries(PROPERTY_SERVICES).map(([service, label]) => (
                  <Label
                    key={service}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-4 w-4"
                    />

                    <span className="text-sm">
                      {label}
                    </span>
                  </Label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor={fieldProps("description").id} className="block text-sm font-medium mb-1">
                Descripción{" "}
                <span className="text-destructive">*</span>
              </Label>

              <Textarea
                  {...fieldProps("description")}
                  aria-required={true}
                placeholder="Ejemplo: Hermosa casa ubicada en zona tranquila..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`bg-white ${
                  errors.description
                    ? "border-destructive"
                    : ""
                }`}
              />

              <FieldError id={errorId("description")}>{errors.description}</FieldError>
            </div>

            <PropertyImages
              images={images}
              onChange={(index, file) => {
                handleImageChange(index, file);
                touch("images");
              }}
              fieldProps={fieldProps("images")}
              error={errors.images}
              errorId={errorId("images")}
              minimum={2}
            />

            {/* Botones */}
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" type="button">
                Cancelar
              </Button>

              <Button type="submit">
                Publicar
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
