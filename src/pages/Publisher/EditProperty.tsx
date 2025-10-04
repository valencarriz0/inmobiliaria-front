import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { MapPin } from "lucide-react";
import HeaderUser from "../../components/HeaderUser";

export default function EditProperty() {
  // Estado interno de la propiedad
  const [title, setTitle] = useState("Casa Familiar con Jardín");
  const [location, setLocation] = useState("Barrio Cerrado, Ciudad");
  const [price, setPrice] = useState("$320,000");
  const [status, setStatus] = useState<"Activa" | "Pausada">("Activa");
  const [features, setFeatures] = useState([
    "3 habitaciones",
    "2 baños",
    "180 m²",
  ]);
  const [description, setDescription] = useState(
    "Esta casa familiar cuenta con amplios espacios, jardín privado y excelente ubicación en un barrio cerrado con seguridad 24/7."
  );
  const [images, setImages] = useState([
    "https://via.placeholder.com/600x400",
    "https://via.placeholder.com/300x200",
    "https://via.placeholder.com/300x200",
  ]);

  const handleSave = () => {
    alert("Cambios guardados!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Estadísticas"
        menuItem3="Configuración"
      />

      {/* Main content */}
      <main className="container mx-auto py-10 px-4 max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">Edit Property</h1>

        {/* Formulario */}
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activa">Active</SelectItem>
                <SelectItem value="Pausada">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Features (comma separated)
            </label>
            <Input
              value={features.join(", ")}
              onChange={(e) =>
                setFeatures(e.target.value.split(",").map((f) => f.trim()))
              }
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Images URLs (comma separated)
            </label>
            <Textarea
              value={images.join(", ")}
              onChange={(e) =>
                setImages(e.target.value.split(",").map((i) => i.trim()))
              }
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-6">
            <Button
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => alert("Cancelled")}>
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
