import { Link } from "react-router-dom";
import type { Consultation } from "../types/consultation";
import { formatDate } from "../lib/formatters";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function ConsultationCard({ consultation, publisher = false }: { consultation: Consultation; publisher?: boolean }) {
  const message = consultation.message?.trim();
  const whatsapp = consultation.phone.replace(/\D/g, "");
  return <Card>
    <CardContent className="flex flex-col sm:flex-row gap-5">
      <img src={consultation.property.images[0]} alt={consultation.property.title} className="w-full h-44 sm:w-36 sm:h-28 rounded-lg object-cover shrink-0" />
      <div className="min-w-0 flex-1 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold break-words">{consultation.property.title}</h2>
          <time dateTime={consultation.createdAt} className="text-sm text-muted-foreground">{formatDate(consultation.createdAt)}</time>
        </div>
        <p className={`whitespace-pre-wrap break-words ${message ? "" : "text-sm text-muted-foreground"}`}>{message || "Sin mensaje adicional"}</p>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{publisher ? "Datos del interesado" : "Datos de contacto utilizados"}</h3>
          <dl className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
            {[
              ["Nombre y apellido", `${consultation.firstName} ${consultation.lastName}`],
              ["Correo electrónico", consultation.email],
              ["WhatsApp / teléfono", consultation.phone],
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to={`${publisher ? "/detailPublisher" : "/detail"}/${consultation.propertyId}`}>Ver propiedad</Link></Button>
          {publisher && <>
            <Button asChild variant="outline" size="sm"><a href={`mailto:${consultation.email}`}>Responder por correo</a></Button>
            {whatsapp && <Button asChild variant="outline" size="sm"><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Responder por WhatsApp</a></Button>}
          </>}
        </div>
      </div>
    </CardContent>
  </Card>;
}
