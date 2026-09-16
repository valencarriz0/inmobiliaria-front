import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import PropertyList from "../../components/PropertyList";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { getPropertyViewHistory } from "../../services/propertyViewHistoryService";
import type { PropertyViewHistoryItem } from "../../types/public-property";

export default function PropertyViewHistory() {
  const [history, setHistory] = useState<PropertyViewHistoryItem[]>([]);
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
        const result = await getPropertyViewHistory(1, 12, controller.signal);
        if (active) setHistory(result.history);
      } catch {
        if (active) setError("No se pudieron cargar las propiedades vistas.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; controller.abort(); };
  }, [retry]);

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2"><h1 className="text-3xl font-bold">Propiedades vistas</h1><p className="text-muted-foreground">Las propiedades públicas que consultaste recientemente.</p></div>
      {loading ? <p role="status">Cargando propiedades vistas...</p> : error ? <div className="space-y-3"><p role="alert">{error}</p><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Reintentar</Button></div>
        : history.length ? <PropertyList properties={history.map(({ property }) => property)} loggedIn /> : <Card><CardContent className="py-8 text-center space-y-4"><h2 className="text-xl font-semibold">Todavía no viste propiedades.</h2><Button asChild><Link to="/HomePageLogin">Explorar propiedades</Link></Button></CardContent></Card>}
    </main>
  </div>;
}
