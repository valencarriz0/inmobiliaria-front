import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { searchAlertService } from "../../services/searchAlertService";
import type { SearchAlert } from "../../types/search-alert";

export default function SearchAlerts() {
  const [alerts, setAlerts] = useState<SearchAlert[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = async () => { setLoading(true); setError(null); try { setAlerts((await searchAlertService.list()).alerts); } catch { setError("No se pudieron cargar tus alertas."); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const toggle = async (alert: SearchAlert) => { try { const result = alert.isActive ? await searchAlertService.deactivate(alert.id) : await searchAlertService.activate(alert.id); setAlerts((items) => items.map((item) => item.id === alert.id ? result.alert : item)); } catch { setError("No se pudo actualizar la alerta."); } };
  return <div className="min-h-screen bg-background"><HeaderUser /><main className="container mx-auto max-w-4xl px-4 py-8 space-y-5"><div><h1 className="text-3xl font-bold">Mis alertas</h1><p className="text-muted-foreground">Recibí avisos de nuevas propiedades que coincidan con tus búsquedas.</p></div>{loading ? <p role="status">Cargando alertas...</p> : error ? <div><p role="alert">{error}</p><Button onClick={() => void load()} variant="outline">Reintentar</Button></div> : alerts.length === 0 ? <Card><CardContent className="py-8 text-center space-y-4"><p>Todavía no creaste alertas de búsqueda.</p><Button asChild><Link to="/HomePageLogin">Explorar propiedades</Link></Button></CardContent></Card> : alerts.map((alert) => <Card key={alert.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="font-semibold">{alert.name || "Alerta de búsqueda"}</h2><p className="text-sm text-muted-foreground">{[alert.operationType, alert.propertyType, alert.city?.name ?? alert.province?.name, alert.currency && [alert.minPrice, alert.maxPrice].filter((v) => v !== null).join(" – ")].filter(Boolean).join(" · ")}</p></div><Button variant="outline" onClick={() => void toggle(alert)}>{alert.isActive ? "Desactivar" : "Activar"}</Button></CardContent></Card>)}</main></div>;
}
