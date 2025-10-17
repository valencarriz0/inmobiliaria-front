import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "./../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./../components/ui/dialog";
import { MapPin, Heart } from "lucide-react";
import BotonVolver from "./../components/BotonVolver";
import { propiedades } from "./../data/propertiesExamples";

export default function PropertyDetail() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [openContact, setOpenContact] = useState(false);
  const [contactNombre, setContactNombre] = useState("");
  const [contactApellido, setContactApellido] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactErrors, setContactErrors] = useState<{
    nombre?: string;
    apellido?: string;
    email?: string;
    whatsapp?: string;
  }>({});
  // Obtener id desde la ruta y buscar propiedad en data
  const { id } = useParams();
  const propId = id ? Number(id) : undefined;
  const property = propiedades.find((p) => p.id === propId) ?? propiedades[0];

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
                    property.category === "Alquiler"
                      ? "bg-[#477ce0]"
                      : property.category === "Venta"
                      ? "bg-[#58b5e0]"
                      : "bg-accent"
                  }`}
                >
                  {property.category}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
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

          <div className="flex items-stretch gap-4">
            <div className="w-2/3 h-80 overflow-hidden rounded-xl bg-muted">
              <img
                src={property.imgUrl1}
                alt={property.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-1/3 flex flex-col gap-4 h-80">
              <div className="flex-1 overflow-hidden rounded-xl bg-muted">
                <img
                  src={property.imgUrl2}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 overflow-hidden rounded-xl bg-muted">
                <img
                  src={property.imgUrl3}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Características y precio */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-x-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                {property.characteristics}
              </span>
            </div>
            <span className="text-3xl font-bold text-accent">
              {property.price}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              Propiedad tipo {property.category} ubicada en {property.location}.
              Ideal para quienes buscan confort y una excelente ubicación.
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
                onClick={() => setOpenContact(true)}
              >
                Quiero que me contacten
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Dialog Contacto con formulario */}
      <Dialog open={openContact} onOpenChange={setOpenContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar al publicador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Nombre"
                className="bg-white dark:bg-input/30"
                value={contactNombre}
                onChange={(e) => setContactNombre(e.target.value)}
              />
              {contactErrors.nombre && (
                <p className="text-sm text-red-600 mt-1">
                  {contactErrors.nombre}
                </p>
              )}
            </div>

            <div>
              <Input
                placeholder="Apellido"
                className="bg-white dark:bg-input/30"
                value={contactApellido}
                onChange={(e) => setContactApellido(e.target.value)}
              />
              {contactErrors.apellido && (
                <p className="text-sm text-red-600 mt-1">
                  {contactErrors.apellido}
                </p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                className="bg-white dark:bg-input/30"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              {contactErrors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {contactErrors.email}
                </p>
              )}
            </div>

            <div>
              <Input
                placeholder="WhatsApp"
                className="bg-white dark:bg-input/30"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
              />
              {contactErrors.whatsapp && (
                <p className="text-sm text-red-600 mt-1">
                  {contactErrors.whatsapp}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const errors: typeof contactErrors = {};

                if (!contactNombre.trim() || contactNombre.trim().length < 2) {
                  errors.nombre =
                    "Ingrese un nombre válido (mínimo 2 caracteres).";
                }

                if (
                  !contactApellido.trim() ||
                  contactApellido.trim().length < 2
                ) {
                  errors.apellido =
                    "Ingrese un apellido válido (mínimo 2 caracteres).";
                }

                const emailRegex = /^\S+@\S+\.\S+$/;
                if (!contactEmail.trim() || !emailRegex.test(contactEmail)) {
                  errors.email = "Ingrese un correo electrónico válido.";
                }

                const digits = contactWhatsapp.replace(/\D/g, "");
                if (!digits || digits.length < 7) {
                  errors.whatsapp =
                    "Ingrese un número de WhatsApp válido (al menos 7 dígitos).";
                }

                setContactErrors(errors);

                if (Object.keys(errors).length === 0) {
                  // Aquí poner la lógica de envío real (API)
                  console.log("Consulta enviada:", {
                    nombre: contactNombre,
                    apellido: contactApellido,
                    email: contactEmail,
                    whatsapp: contactWhatsapp,
                    propertyId: property.id,
                  });
                  // Resetear formulario
                  setContactNombre("");
                  setContactApellido("");
                  setContactEmail("");
                  setContactWhatsapp("");
                  setOpenContact(false);
                  setTimeout(
                    () =>
                      alert(
                        "Consulta enviada. El publicador se pondrá en contacto."
                      ),
                    100
                  );
                }
              }}
            >
              Enviar consulta
            </Button>
          </DialogFooter>
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
