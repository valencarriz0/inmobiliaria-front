import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import ConsultationCard from "../../components/ConsultationCard";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { consultationService } from "../../services/consultationService";
import type { Consultation } from "../../types/consultation";

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

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{publisher ? "Consultas recibidas" : "Mis consultas"}</h1>
        <p className="text-muted-foreground">{publisher ? "Personas que solicitaron información sobre tus propiedades." : "Consultá las solicitudes de información que realizaste sobre propiedades de otros publicadores."}</p>
      </div>
      {loading ? <p role="status">Cargando consultas...</p> : error ? <div className="space-y-3">
        <p role="alert">{error}</p>
        <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Reintentar</Button>
      </div> : consultations.length > 0 ? consultations.map((consultation) => <ConsultationCard key={consultation.id} consultation={consultation} publisher={publisher} />) : <Card>
        <CardContent className="text-center py-8 space-y-4">
          <h2 className="text-xl font-semibold">{publisher ? "Todavía no recibiste consultas" : "Todavía no realizaste consultas"}</h2>
          <Button asChild><Link to={publisher ? "/dashboard" : "/HomePageLogin"}>{publisher ? "Ver mis propiedades" : "Explorar propiedades"}</Link></Button>
        </CardContent>
      </Card>}
    </main>
  </div>;
}
