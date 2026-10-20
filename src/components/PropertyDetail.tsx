import PropertyGallery from "./PropertyGallery";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { InputField } from "./ui/input-field";
import { useFormValidation } from "../hooks/use-form-validation";
import { validateEmail, validateName, validatePhone } from "../lib/validation";
import { Building2, CircleCheck, Mail, MapPin, Navigation, Phone, Send, UserRound } from "lucide-react";
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
  const [contactNombre, setContactNombre] = useState(() => user?.firstName ?? "");
  const [contactApellido, setContactApellido] = useState(() => user?.lastName ?? "");
  const [contactEmail, setContactEmail] = useState(() => user?.email ?? "");
  const [contactWhatsapp, setContactWhatsapp] = useState(() => user?.phone ?? "");
  const contactValidation = useFormValidation(() => ({
    nombre: validateName(contactNombre, "nombre"),
    apellido: validateName(contactApellido, "apellido"),
    email: validateEmail(contactEmail),
    whatsapp: validatePhone(contactWhatsapp),
  }));
  useEffect(() => {
    if (!user) return;
    setContactNombre((current) => current || user.firstName);
    setContactApellido((current) => current || user.lastName);
    setContactEmail((current) => current || user.email);
    setContactWhatsapp((current) => current || user.phone || "");
  }, [user]);
  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property.canConsult || isSubmittingContact || !contactValidation.validateForm(event.currentTarget)) return;
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
  const locationName = formatPublicLocation(property.location);
  const fullAddress = [address, locationName].filter(Boolean).join(", ");
  const publisher = property.publisher;
  const publisherContactName = [publisher?.firstName, publisher?.lastName].filter(Boolean).join(" ");
  const publisherName = publisher?.agencyName
    || publisherContactName
    || "Publicador de la propiedad";
  const publisherKind = publisher?.publisherType === "agency"
    ? ["Inmobiliaria", publisherContactName].filter(Boolean).join(" · ")
    : publisher?.publisherType === "individual" ? "Propietario particular" : "Publicador verificado";
  const directionsUrl = hasValidCoordinates(property.latitude, property.longitude)
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${property.latitude},${property.longitude}`)}`
    : undefined;
  const details: { label: string; value: string | number | undefined }[] = [
    { label: "Categoría", value: OPERATION_TYPES[property.operationType] },
    { label: "Tipo de inmueble", value: PROPERTY_TYPES[property.propertyType] },
    { label: "Superficie total", value: formatArea(property.totalArea) },
    ...(property.propertyType === "land" ? [] : [
      { label: "Ambientes", value: property.rooms },
      { label: "Dormitorios", value: property.bedrooms },
      { label: "Baños", value: property.bathrooms },
    ]),
    { label: "Antigüedad", value: property.age === undefined ? undefined : `${property.age} ${property.age === 1 ? "año" : "años"}` },
    { label: "Estado del inmueble", value: property.propertyCondition === undefined ? undefined : PROPERTY_CONDITIONS[property.propertyCondition] },
    { label: "Mascotas", value: property.acceptsPets === undefined ? undefined : property.acceptsPets ? "Acepta mascotas" : "No acepta mascotas" },
    ...(property.propertyType === "land" ? [] : [{ label: "Cocheras", value: property.garage }]),
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
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full text-primary-foreground ${
                    property.operationType === "rent" ? "bg-primary"
                      : property.operationType === "sale" ? "bg-secondary" : "bg-tertiary"
                  }`}>{OPERATION_TYPES[property.operationType]}</span>
                </div>
                {/* <p className="flex items-start text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1 mt-1 shrink-0" aria-hidden="true" />
                  <span>{address && `${address}, `}{formatPublicLocation(property.location)}</span>
                </p> */}
              </div>
              <FavoriteHeartButton
                property={property}
                className="relative shrink-0 self-start"
                buttonClassName="h-12 w-12 rounded-none border-0 bg-transparent p-0 shadow-none transition-transform hover:scale-110 hover:bg-transparent"
                heartClassName="h-10 w-10"
              />
            </div>
          </div>

          <PropertyGallery property={property} />

          <p className="text-3xl font-bold text-foreground border-b pb-4 break-words">
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
                {property.services.map((service) => <li className="rounded-full bg-tertiary px-3 py-1 text-tertiary-foreground" key={service}>{PROPERTY_SERVICES[service as keyof typeof PROPERTY_SERVICES] ?? service}</li>)}
              </ul>
            </section>
          )}
          {property.amenities.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Comodidades</h2>
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => <li className="rounded-full bg-tertiary px-3 py-1 text-tertiary-foreground" key={amenity}>{PROPERTY_AMENITIES[amenity as keyof typeof PROPERTY_AMENITIES] ?? amenity}</li>)}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{property.description}</p>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="gap-0 overflow-hidden bg-background py-0 shadow-md">
           {/* <CardHeader className="border-b px-5 py-4">
              {/* <CardTitle className="text-lg">Ubicación</CardTitle>
            </CardHeader>*/}
            {hasValidCoordinates(property.latitude, property.longitude) ? (
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                displayName={locationName}
                className="h-[21rem] rounded-none"
              />
            ) : (
              <div className="grid h-56 place-items-center bg-muted px-6 text-center">
                <div>
                  <MapPin className="mx-auto mb-3 size-8 text-foreground" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p>
                </div>
              </div>
            )}
            <CardContent className="flex items-center gap-3 px-5 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-foreground">
                <Navigation className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dirección</p>
                <p className="break-words text-sm font-semibold">{fullAddress || "Ubicación informada por el publicador"}</p>
              </div>
              {directionsUrl && (
                <a href={directionsUrl} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-foreground hover:underline">
                  Cómo llegar
                </a>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 bg-background py-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-foreground">
                  {publisher?.publisherType === "agency"
                    ? <Building2 className="size-5" aria-hidden="true" />
                    : <UserRound className="size-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Publicado por</p>
                  <h2 className="break-words text-sm font-semibold">{publisherName}</h2>
                  <p className="text-sm text-muted-foreground">{publisherKind}</p>
                </div>
              </div>
              {(publisher?.email || publisher?.phone) && (
                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                  {publisher.email && (
                    <a href={`mailto:${publisher.email}`} className="flex items-center gap-2 break-all text-muted-foreground transition hover:text-foreground">
                      <Mail className="size-4 shrink-0" aria-hidden="true" />{publisher.email}
                    </a>
                  )}
                  {publisher.phone && (
                    <a href={`tel:${publisher.phone}`} className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground">
                      <Phone className="size-4 shrink-0" aria-hidden="true" />{publisher.phone}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 border-accent/20 bg-accent/5 py-0 shadow-md">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="text-xl">Solicitá más información</CardTitle>
              <p className="text-sm text-muted-foreground">
                {property.canConsult
                  ? "Completá tus datos y el publicador podrá responder tu consulta."
                  : "No podés realizar consultas sobre una propiedad publicada por vos."}
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {!property.canConsult ? (
                <div role="status" className="rounded-xl border border-accent/20 bg-background p-5 text-center">
                  <p className="font-semibold">Esta es tu propiedad</p>
                  <p className="mt-1 text-sm text-muted-foreground">El envío de consultas está deshabilitado para propiedades propias.</p>
                  <Button type="button" disabled className="mt-4 h-11 w-full rounded-full">
                    Enviar consulta
                  </Button>
                </div>
              ) : contactSuccess ? (
                <div role="status" className="rounded-xl border border-accent/20 bg-background p-5 text-center">
                  <CircleCheck className="mx-auto mb-3 size-10 text-foreground" aria-hidden="true" />
                  <p className="font-semibold">Consulta enviada</p>
                  <p className="mt-1 text-sm text-muted-foreground">Tus datos fueron enviados correctamente al publicador.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 rounded-full"
                    onClick={() => {
                      setContactSuccess(false);
                      setMessage("");
                      contactValidation.resetValidation();
                    }}
                  >
                    Enviar otra consulta
                  </Button>
                </div>
              ) : (
                <form noValidate className="space-y-4" onSubmit={submitContact}>
                  {[
                    { name: "nombre", label: "Nombre", placeholder: "Tu nombre", value: contactNombre, setValue: setContactNombre, type: "text", autoComplete: "given-name" },
                    { name: "apellido", label: "Apellido", placeholder: "Tu apellido", value: contactApellido, setValue: setContactApellido, type: "text", autoComplete: "family-name" },
                    { name: "email", label: "Correo electrónico", placeholder: "nombre@correo.com", value: contactEmail, setValue: setContactEmail, type: "email", autoComplete: "email" },
                    { name: "whatsapp", label: "WhatsApp / teléfono", placeholder: "+54 9 351 555 0000", value: contactWhatsapp, setValue: setContactWhatsapp, type: "tel", autoComplete: "tel" },
                  ].map((field) => (
                    <InputField
                      key={field.name}
                      {...contactValidation.fieldProps(field.name)}
                      label={field.label}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      required
                      placeholder={field.placeholder}
                      disabled={isSubmittingContact}
                      value={field.value}
                      className="h-11 rounded-xl border-border bg-background px-4"
                      onChange={(event) => { field.setValue(event.target.value); setContactError(""); }}
                      error={contactValidation.errors[field.name]}
                      errorId={contactValidation.errorId(field.name)}
                    />
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor={messageId}>Mensaje (opcional)</Label>
                    <Textarea
                      id={messageId}
                      name="message"
                      rows={4}
                      disabled={isSubmittingContact}
                      value={message}
                      className="min-h-28 resize-y rounded-xl border-border bg-background px-4 py-3"
                      onChange={(event) => { setMessage(event.target.value); setContactError(""); }}
                      placeholder="Hola, quisiera recibir más información sobre esta propiedad."
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Al enviar este formulario, tus datos se compartirán con el publicador únicamente para responder esta consulta.
                  </p>
                  {contactError && <p role="alert" className="text-sm text-destructive">{contactError}</p>}
                  <Button type="submit" disabled={isSubmittingContact} className="h-11 w-full cursor-pointer rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="size-4" aria-hidden="true" />
                    {isSubmittingContact ? "Enviando..." : "Enviar consulta"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">© 2025 Nombre y Logo. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
