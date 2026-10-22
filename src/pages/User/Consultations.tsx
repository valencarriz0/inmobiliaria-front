import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ConsultationCard from "../../components/ConsultationCard";
import { consultationService } from "../../services/consultationService";
import type { Consultation } from "../../types/consultation";
import { CardListSkeleton } from "../../components/LoadingSkeletons";

export default function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await consultationService.mine(controller.signal);
        if (active) setConsultations(result);
      } catch {
        if (active) setError("No se pudieron cargar tus consultas.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [retry]);

  return <article className="publisher-panel publisher-consultations-panel">
    <div className="publisher-panel-heading">
      <div>
        <h1>Mis consultas</h1>
        <p>Solicitudes de información que enviaste a otros publicadores</p>
      </div>
    </div>

    <div className="publisher-consultation-list publisher-consultation-grid">
      {loading ? <CardListSkeleton label="Cargando consultas..." variant="consultations" /> : error ? (
        <div className="publisher-empty-state publisher-consultation-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
        </div>
      ) : consultations.length > 0 ? consultations.map((consultation) => (
        <ConsultationCard key={consultation.id} consultation={consultation} />
      )) : (
        <div className="publisher-empty-state user-consultations-empty">
          <MessageCircle size={24} aria-hidden="true" />
          <h2>Todavía no realizaste consultas</h2>
          <p>Explorá las propiedades y contactá al publicador de la que te interese.</p>
          <Link className="user-consultations-primary-action" to="/">Explorar propiedades</Link>
        </div>
      )}
    </div>
  </article>;
}
