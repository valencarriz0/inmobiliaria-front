import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import { AdminUsersSection } from "./AdminSections";

export default function AdminUsersPage() { return <div className="min-h-screen bg-background"><HeaderUser /><BotonVolver fallbackTo="/admin" /><main className="container mx-auto max-w-6xl px-4 py-8 space-y-6"><div><h1 className="text-3xl font-bold">Administrar usuarios</h1><p className="text-muted-foreground">Consultá y gestioná las cuentas de la plataforma.</p></div><AdminUsersSection /></main></div>; }
