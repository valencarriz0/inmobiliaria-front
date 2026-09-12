import PropertyGallery from "./PropertyGallery";
import { useState } from "react";
import { Button } from "./../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../components/ui/card";
import { InputField } from "./ui/input-field";
import { useFormValidation } from "../hooks/use-form-validation";
import { validateEmail, validateName, validatePhone } from "../lib/validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./../components/ui/dialog";
import { MapPin, Heart } from "lucide-react";
import BotonVolver from "./../components/BotonVolver";
import type { Property } from "../types/property";
import { OPERATION_TYPES } from "../constants/property";
import { formatCharacteristics, formatLocation, formatPrice } from "../lib/formatters";

export default function PropertyDetail({ property }: { property: Property }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [contactNombre, setContactNombre] = useState("");
  const [contactApellido, setContactApellido] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const contactValidation = useFormValidation(() => ({
    nombre: validateName(contactNombre, "nombre"),
    apellido: validateName(contactApellido, "apellido"),
    email: validateEmail(contactEmail),
    whatsapp: validatePhone(contactWhatsapp),
  }));
  const changeContactOpen = (open: boolean) => {
    setOpenContact(open);
    contactValidation.resetValidation();
  };

  return (
    <div className="min-h-screen bg-background">
      <BotonVolver />

      {/* Main */}
      <main className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título, ubicación y Guardar */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold mb-1">{property.title}</h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${
                    property.operationType === "rent"
                      ? "bg-[#477ce0]"
                      : property.operationType === "sale"
                      ? "bg-[#58b5e0]"
                      : "bg-accent"
                  }`}
                >
                  {OPERATION_TYPES[property.operationType]}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {formatLocation(property.location)}
              </div>
            </div>
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
              <span>Guardar</span>
            </Button>
          </div>

          <PropertyGallery property={property} />

          {/* Características y precio */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-x-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                {formatCharacteristics(property).join(", ")}
              </span>
            </div>
            <span className="text-3xl font-bold text-accent">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>
        </div>

        {/* Sidebar derecha */}
        <aside className="space-y-6">
          {/* Mapa */}
          <Card className="h-56">
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full bg-muted rounded-lg">
              Mapa aquí
            </CardContent>
          </Card>

          {/* Reseñas */}
          <Card>
            <CardHeader>
              <CardTitle>Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                ★★★★☆ (12 reseñas)
              </p>
              <Button variant="link" className="mt-2 p-0">
                Ver todas las reseñas
              </Button>
            </CardContent>
          </Card>

          {/* Publicador + Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Publicado por</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="font-semibold">Inmobiliaria XYZ</p>
                  <p className="text-sm text-muted-foreground">
                    contacto@xyz.com
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => changeContactOpen(true)}
              >
                Quiero que me contacten
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Dialog Contacto con formulario */}
      <Dialog open={openContact} onOpenChange={changeContactOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contactar al publicador</DialogTitle>
            <DialogDescription>Completá tus datos para que el publicador pueda contactarte.</DialogDescription>
          </DialogHeader>
          <form noValidate className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!contactValidation.validateForm(event.currentTarget)) return;
            // Aquí se conectará el envío de la consulta con la API.
            setContactNombre("");
            setContactApellido("");
            setContactEmail("");
            setContactWhatsapp("");
            changeContactOpen(false);
            setTimeout(() => alert("Consulta enviada. El publicador se pondrá en contacto."), 100);
          }}>
            {[
              { name: "nombre", label: "Nombre", value: contactNombre, setValue: setContactNombre, type: "text", autoComplete: "given-name" },
              { name: "apellido", label: "Apellido", value: contactApellido, setValue: setContactApellido, type: "text", autoComplete: "family-name" },
              { name: "email", label: "Correo electrónico", value: contactEmail, setValue: setContactEmail, type: "email", autoComplete: "email" },
              { name: "whatsapp", label: "WhatsApp", value: contactWhatsapp, setValue: setContactWhatsapp, type: "tel", autoComplete: "tel" },
            ].map((field) => (
              <InputField key={field.name} {...contactValidation.fieldProps(field.name)} label={field.label} type={field.type} autoComplete={field.autoComplete} required placeholder={field.label} value={field.value} onChange={(event) => field.setValue(event.target.value)} error={contactValidation.errors[field.name]} errorId={contactValidation.errorId(field.name)} />
            ))}
            <DialogFooter>
              <Button type="submit">Enviar consulta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
