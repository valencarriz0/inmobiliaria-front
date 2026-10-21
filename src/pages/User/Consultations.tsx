import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import ConsultationCard from "../../components/ConsultationCard";
import { consultationService } from "../../services/consultationService";
import type { Consultation } from "../../types/consultation";
import "../Publisher/HomePublisher.css";

export default function Consultations({ publisher = false }: { publisher?: boolean }) {
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
        const result = publisher
          ? await consultationService.publisher(undefined, controller.signal)
          : await consultationService.mine(controller.signal);
        if (active) setConsultations(result);
      } catch {
        if (active) setError(publisher ? "No se pudieron cargar las consultas recibidas." : "No se pudieron cargar tus consultas.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [publisher, retry]);

  return <div className="publisher-dashboard-page">
    <HeaderUser />
    <BotonVolver fallbackTo={publisher ? "/dashboard" : "/"} />
    <main className="publisher-dashboard user-consultations-dashboard">
      <section className="publisher-workspace" aria-labelledby="user-consultations-title">
        <div className="publisher-tabs user-consultations-tabs" aria-hidden="true">
          <span className="publisher-tab is-selected">{publisher ? "Consultas" : "Mis consultas"}</span>
        </div>

        <div className="publisher-tabpanel">
          <article className="publisher-panel publisher-consultations-panel">
            <div className="publisher-panel-heading">
              <div>
                <h1 id="user-consultations-title">{publisher ? "Consultas recibidas" : "Mis consultas"}</h1>
                <p>{publisher ? "Personas interesadas en tus propiedades" : "Solicitudes de información que enviaste a otros publicadores"}</p>
              </div>
            </div>

            <div className="publisher-consultation-list publisher-consultation-grid">
              {loading ? <p className="publisher-empty-state" role="status">Cargando consultas...</p> : error ? (
                <div className="publisher-empty-state publisher-consultation-error" role="alert">
                  <span>{error}</span>
                  <button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
                </div>
              ) : consultations.length > 0 ? consultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} publisher={publisher} />
              )) : (
                <div className="publisher-empty-state user-consultations-empty">
                  <MessageCircle size={24} aria-hidden="true" />
                  <h2>{publisher ? "Todavía no recibiste consultas" : "Todavía no realizaste consultas"}</h2>
                  <p>{publisher ? "Cuando alguien se interese en una propiedad, su consulta aparecerá acá." : "Explorá las propiedades y contactá al publicador de la que te interese."}</p>
                  <Link className="user-consultations-primary-action" to={publisher ? "/dashboard" : "/"}>{publisher ? "Ver mis propiedades" : "Explorar propiedades"}</Link>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>;
}
