import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import ConsultationCard from "../../components/ConsultationCard";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import { mockConsultations } from "../../data/mock/activity";
import { isOwnProperty } from "../../lib/user-properties";

export default function Consultations({ publisher = false }: { publisher?: boolean }) {
  const { user } = useAuth();
  const consultations = mockConsultations.filter((consultation) => publisher
    ? isOwnProperty(user, consultation) && consultation.userEmail !== user?.email
    : Boolean(user) && consultation.userEmail === user?.email && !isOwnProperty(user, consultation),
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{publisher ? "Consultas recibidas" : "Mis consultas"}</h1>
        <p className="text-muted-foreground">{publisher ? "Personas que solicitaron información sobre tus propiedades." : "Consultá las solicitudes de información que realizaste sobre propiedades de otros publicadores."}</p>
        <p className="text-sm text-muted-foreground">Vista previa con consultas de ejemplo. El envío de nuevas consultas todavía no está disponible.</p>
      </div>
      {consultations.length > 0 ? consultations.map((consultation) => <ConsultationCard key={consultation.id} consultation={consultation} publisher={publisher} />) : <Card>
        <CardContent className="text-center py-8 space-y-4">
          <h2 className="text-xl font-semibold">{publisher ? "Todavía no recibiste consultas" : "Todavía no realizaste consultas"}</h2>
          <Button asChild><Link to={publisher ? "/dashboard" : "/HomePageLogin"}>{publisher ? "Ver mis propiedades" : "Explorar propiedades"}</Link></Button>
        </CardContent>
      </Card>}
    </main>
  </div>;
}
