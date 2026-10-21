import { Link } from "react-router-dom";
import { ExternalLink, Mail, MessageCircleMore } from "lucide-react";
import type { Consultation } from "../types/consultation";
import { formatDate } from "../lib/formatters";

type ConsultationCardProps = {
  consultation: Consultation;
  publisher?: boolean;
  isNew?: boolean;
  onMarkSeen?: () => void;
};

function Initials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return <span className="publisher-avatar" aria-hidden="true">{initials}</span>;
}

function timeAgo(date: string) {
  const elapsed = Math.max(0, Date.now() - new Date(date).getTime());
  const hours = Math.floor(elapsed / 3_600_000);
  if (hours < 1) return "Hace unos minutos";
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.floor(hours / 24)} d`;
}

export default function ConsultationCard({ consultation, publisher = false, isNew = false, onMarkSeen }: ConsultationCardProps) {
  const message = consultation.message?.trim();
  const whatsapp = consultation.phone.replace(/\D/g, "");

  const name = `${consultation.firstName} ${consultation.lastName}`;
  const details = publisher
    ? [["Mensaje", message || "No hay mensaje."], ["Correo electrónico", consultation.email], ["Teléfono", consultation.phone || "No informado"]]
    : [["Mensaje enviado", message || "Sin mensaje adicional"], ["Correo utilizado", consultation.email], ["Teléfono utilizado", consultation.phone || "No informado"]];

  return (
    <article className={`publisher-consultation-card ${isNew ? "is-new" : ""}`}>
      <div className="publisher-consultation-topline">
        <Initials name={name} />
        <div className="publisher-consultation-heading">
          <strong>{name}</strong>
          <time dateTime={consultation.createdAt} title={formatDate(consultation.createdAt)}>{timeAgo(consultation.createdAt)}</time>
        </div>
        {isNew && <span className="publisher-new-badge"><span className="publisher-new-dot" />Nueva</span>}
      </div>

      <div className="publisher-consultation-body">
        <img src={consultation.property.images[0]} alt="" />
        <div><strong>Consulta por {consultation.property.title}</strong></div>
      </div>

      <dl className="publisher-consultation-contact-details" aria-label={publisher ? "Datos del interesado" : "Datos de contacto utilizados"}>
        {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <div className="publisher-consultation-actions">
        <Link className="publisher-consultation-action is-subtle" to={`${publisher ? "/detailPublisher" : "/detail"}/${consultation.propertyId}`}>
          <ExternalLink size={14} /> Ver propiedad
        </Link>
        {publisher && <>
          <a className="publisher-consultation-action" href={`mailto:${consultation.email}`}><Mail size={14} /> Responder por correo</a>
          {whatsapp && <a className="publisher-consultation-action is-whatsapp" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircleMore size={14} /> WhatsApp</a>}
        </>}
        {isNew && onMarkSeen && <button className="publisher-mark-seen" type="button" onClick={onMarkSeen}>Marcar como vista</button>}
      </div>
    </article>
  );
}
