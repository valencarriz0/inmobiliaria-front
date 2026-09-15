import { Link } from "react-router-dom";
import type { Consultation } from "../types/consultation";
import { formatDate } from "../lib/formatters";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function ConsultationCard({ consultation, publisher = false }: { consultation: Consultation; publisher?: boolean }) {
  const message = consultation.message?.trim();
  return <Card>
    <CardContent className="flex flex-col sm:flex-row gap-5">
      <img src={consultation.propertyImage} alt={consultation.propertyTitle} className="w-full h-44 sm:w-36 sm:h-28 rounded-lg object-cover shrink-0" />
      <div className="min-w-0 flex-1 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold break-words">{consultation.propertyTitle}</h2>
          <time dateTime={consultation.createdAt} className="text-sm text-muted-foreground">{formatDate(consultation.createdAt)}</time>
        </div>
        <p className={`whitespace-pre-wrap break-words ${message ? "" : "text-sm text-muted-foreground"}`}>{message || "Sin mensaje adicional"}</p>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{publisher ? "Datos del interesado" : "Datos de contacto utilizados"}</h3>
          <dl className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
            {[
              ["Nombre y apellido", `${consultation.contact.firstName} ${consultation.contact.lastName}`],
              ["Correo electrónico", consultation.contact.email],
              ["WhatsApp / teléfono", consultation.contact.phone],
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}
          </dl>
        </div>
        <Button asChild variant="outline" size="sm"><Link to={`${publisher ? "/detailPublisher" : "/detailLogin"}/${consultation.propertyId}`}>Ver propiedad</Link></Button>
      </div>
    </CardContent>
  </Card>;
}
