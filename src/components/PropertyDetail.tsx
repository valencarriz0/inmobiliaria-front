import PropertyGallery from "./PropertyGallery";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { InputField } from "./ui/input-field";
import { useFormValidation } from "../hooks/use-form-validation";
import { validateEmail, validateName, validatePhone } from "../lib/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { MapPin } from "lucide-react";
import BotonVolver from "./BotonVolver";
import type { PublicPropertyDetail } from "../types/public-property";
import { OPERATION_TYPES, PROPERTY_TYPES, PROPERTY_CONDITIONS, PROPERTY_SERVICES, PROPERTY_AMENITIES } from "../constants/property";
import { formatArea, formatPublicLocation, formatPrice } from "../lib/formatters";
import { rememberProperty } from "../lib/recent-properties";
import { useAuth } from "../hooks/use-auth";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import PropertyMap from "./maps/PropertyMap";
import { hasValidCoordinates } from "../lib/geocoding";
import FavoriteHeartButton from "./FavoriteHeartButton";
import { consultationService } from "../services/consultationService";
import { ApiError } from "../services/api";
import { registerPublicPropertyView } from "../services/publicPropertyService";

export default function PropertyDetail({ property }: { property: PublicPropertyDetail }) {
  const { user } = useAuth();
  const messageId = useId();
  const [message, setMessage] = useState("");
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const viewRegistered = useRef(false);
  useEffect(() => { rememberProperty(property.id); }, [property.id]);
  useEffect(() => {
    if (viewRegistered.current) return;
    viewRegistered.current = true;
    void registerPublicPropertyView(property.id).catch(() => undefined);
  }, [property.id]);
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
    if (open) {
      setContactNombre(user?.firstName ?? "");
      setContactApellido(user?.lastName ?? "");
      setContactEmail(user?.email ?? "");
      setContactWhatsapp(user?.phone ?? "");
      setMessage("");
    }
    setOpenContact(open);
    setIsSubmittingContact(false);
    setContactError("");
    setContactSuccess(false);
    contactValidation.resetValidation();
  };
  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingContact || !contactValidation.validateForm(event.currentTarget)) return;
    setIsSubmittingContact(true);
    setContactError("");
    try {
      await consultationService.create(property.id, {
        firstName: contactNombre.trim(),
        lastName: contactApellido.trim(),
        email: contactEmail.trim(),
        phone: contactWhatsapp.trim(),
        message: message.trim() || undefined,
      });
      setContactSuccess(true);
    } catch (error) {
      setContactError(error instanceof ApiError ? error.message : "No se pudo enviar la consulta. Intentá nuevamente.");
    } finally {
      setIsSubmittingContact(false);
    }
  };
  const address = [property.location.street, property.location.number].filter(Boolean).join(" ");
  const details: { label: string; value: string | number | undefined }[] = [
    { label: "Categoría", value: OPERATION_TYPES[property.operationType] },
    { label: "Tipo de inmueble", value: PROPERTY_TYPES[property.propertyType] },
    { label: "Superficie total", value: formatArea(property.totalArea) },
    { label: "Ambientes", value: property.rooms },
    { label: "Dormitorios", value: property.bedrooms },
    { label: "Baños", value: property.bathrooms },
    { label: "Antigüedad", value: property.age === undefined ? undefined : `${property.age} ${property.age === 1 ? "año" : "años"}` },
    { label: "Estado del inmueble", value: property.propertyCondition === undefined ? undefined : PROPERTY_CONDITIONS[property.propertyCondition] },
    { label: "Mascotas", value: property.acceptsPets === undefined ? undefined : property.acceptsPets ? "Acepta mascotas" : "No acepta mascotas" },
    { label: "Cocheras", value: property.garage },
    { label: "Expensas", value: property.expenses === undefined ? undefined : formatPrice(property.expenses, property.currency) },
    { label: "Impuestos", value: property.taxes === undefined ? undefined : formatPrice(property.taxes, property.currency) },
    { label: "Comisiones", value: property.commissions === undefined ? undefined : formatPrice(property.commissions, property.currency) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BotonVolver />
      <main className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 min-w-0 space-y-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold mb-1 break-words">{property.title}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${
                    property.operationType === "rent" ? "bg-[#477ce0]"
                      : property.operationType === "sale" ? "bg-[#58b5e0]" : "bg-accent"
                  }`}>{OPERATION_TYPES[property.operationType]}</span>
                </div>
                <p className="flex items-start text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1 mt-1 shrink-0" aria-hidden="true" />
                  <span>{address && `${address}, `}{formatPublicLocation(property.location)}</span>
                </p>
              </div>
              <FavoriteHeartButton property={property} className="relative shrink-0" buttonClassName="rounded-full bg-muted hover:bg-muted/80 hover:scale-110" />
            </div>
          </div>

          <PropertyGallery property={property} />

          <p className="text-3xl font-bold text-accent border-b pb-4 break-words">
            {formatPrice(property.price, property.currency)}
          </p>
          <section>
            <h2 className="text-xl font-semibold mb-4">Características</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.map(({ label, value }) => value === undefined ? null : (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {property.services.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Servicios</h2>
              <ul className="flex flex-wrap gap-2">
                {property.services.map((service) => <li className="px-3 py-1 rounded-full bg-accent/10 text-accent" key={service}>{PROPERTY_SERVICES[service as keyof typeof PROPERTY_SERVICES] ?? service}</li>)}
              </ul>
            </section>
          )}
          {property.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Comodidades</h2>
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => <li className="px-3 py-1 rounded-full bg-accent/10 text-accent" key={amenity}>{PROPERTY_AMENITIES[amenity as keyof typeof PROPERTY_AMENITIES] ?? amenity}</li>)}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{property.description}</p>
          </section>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Ubicación</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {address && <p>{address}</p>}
              <p>{property.location.city}</p>
              <p>{property.location.province}</p>
              <PropertyMap latitude={property.latitude} longitude={property.longitude} displayName={formatPublicLocation(property.location)} />
              {!hasValidCoordinates(property.latitude, property.longitude) && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Dejá tus datos para que el publicador pueda contactarte.</p>
              <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => changeContactOpen(true)}>Ver formulario de contacto</Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      <Dialog open={openContact} onOpenChange={changeContactOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contactar al publicador</DialogTitle>
            <DialogDescription>Completá tus datos para recibir información sobre esta propiedad.</DialogDescription>
          </DialogHeader>
          {contactSuccess ? <div className="space-y-4">
            <p role="status" className="text-sm text-muted-foreground">Tu consulta fue enviada correctamente.</p>
            <DialogFooter><Button type="button" onClick={() => changeContactOpen(false)}>Cerrar</Button></DialogFooter>
          </div> : <form noValidate className="space-y-4" onSubmit={submitContact}>
            {[
              { name: "nombre", label: "Nombre", value: contactNombre, setValue: setContactNombre, type: "text", autoComplete: "given-name" },
              { name: "apellido", label: "Apellido", value: contactApellido, setValue: setContactApellido, type: "text", autoComplete: "family-name" },
              { name: "email", label: "Correo electrónico", value: contactEmail, setValue: setContactEmail, type: "email", autoComplete: "email" },
              { name: "whatsapp", label: "WhatsApp / teléfono", value: contactWhatsapp, setValue: setContactWhatsapp, type: "tel", autoComplete: "tel" },
            ].map((field) => (
              <InputField key={field.name} {...contactValidation.fieldProps(field.name)} label={field.label} type={field.type} autoComplete={field.autoComplete} required placeholder={field.label} disabled={isSubmittingContact} value={field.value} onChange={(event) => { field.setValue(event.target.value); setContactError(""); }} error={contactValidation.errors[field.name]} errorId={contactValidation.errorId(field.name)} />
            ))}
            <div className="space-y-2">
              <Label htmlFor={messageId}>Mensaje (opcional)</Label>
              <Textarea id={messageId} name="message" rows={3} disabled={isSubmittingContact} value={message} onChange={(event) => { setMessage(event.target.value); setContactError(""); }} placeholder="Ej.: Quisiera saber si aceptan mascotas o coordinar una visita." />
            </div>
            {contactError && <p role="alert" className="text-sm text-red-600">{contactError}</p>}
            <DialogFooter><Button type="submit" disabled={isSubmittingContact}>{isSubmittingContact ? "Enviando..." : "Quiero que me contacten"}</Button></DialogFooter>
          </form>}
        </DialogContent>
      </Dialog>
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">© 2025 Nombre y Logo. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
