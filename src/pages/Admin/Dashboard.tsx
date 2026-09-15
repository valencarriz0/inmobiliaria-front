import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";

const sections = [
  { id: "users", title: "Usuarios", columns: ["Nombre", "Correo", "Rol", "Estado"], message: "La lista de usuarios estará disponible cuando se conecten los datos del sistema." },
  { id: "requests", title: "Solicitudes de publicadores", columns: ["Solicitante", "Tipo de publicador", "Fecha", "Estado"], message: "Las solicitudes y su revisión todavía no están disponibles." },
  { id: "properties", title: "Publicaciones", columns: ["Título", "Publicador", "Categoría", "Estado"], message: "La gestión administrativa de publicaciones todavía no está disponible." },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Administración</h1>
          <Button asChild variant="outline"><Link to="/HomePageLogin">Ver catálogo</Link></Button>
        </div>
        <p className="text-muted-foreground">Vista previa del panel. La gestión de usuarios, solicitudes y publicaciones aún no está habilitada.</p>
        <Tabs defaultValue="users">
          <TabsList className="justify-start">
            {sections.map(({ id, title }) => <TabsTrigger key={id} value={id}>{title}</TabsTrigger>)}
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>
          {sections.map(({ id, title, columns, message }) => <TabsContent key={id} value={id}>
            <Card>
              <CardHeader><CardTitle>{title}</CardTitle><CardDescription>Sección pendiente de habilitación.</CardDescription></CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">{title}</caption>
                    <thead className="bg-muted"><tr>{columns.map((column) => <th scope="col" key={column} className="p-3 whitespace-nowrap">{column}</th>)}</tr></thead>
                    <tbody><tr><td colSpan={columns.length} className="p-6 text-center text-muted-foreground">{message}</td></tr></tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>)}
          <TabsContent value="metrics"><Card><CardHeader><CardTitle>Métricas</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Las métricas estarán disponibles cuando existan datos del sistema para calcularlas.</p></CardContent></Card></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
