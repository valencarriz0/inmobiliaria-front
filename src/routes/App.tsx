import { Routes, Route, Outlet, Navigate, Link, useParams } from "react-router-dom";
import HomePageWireframe from "../pages/InterestedUser/Sin Login/HomePage";
import PropertyDetailPage from "../pages/InterestedUser/Sin Login/PropertyDetailPage";
import PostPage from "../pages/Publisher/PostPage";
import PublisherRegistration from "../pages/Publisher/Registration";
import PublisherDashboard from "../pages/Publisher/HomePublisher";
import PropertyDetailPublisher from "../pages/Publisher/PropertyDetailPublisher";
import EditProperty from "../pages/Publisher/EditProperty";
import NewProperty from "../pages/Publisher/NewProperty";
import Profile from "../pages/User/Profile";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminPropertyDetail from "../pages/Admin/PropertyDetail";
import Header from "../components/Header";
import AuthModals from "../components/Modals/AuthModals";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Favorites from "../pages/User/Favorites";
import Activity from "../pages/User/Activity";
import VerifyEmail from "../pages/User/VerifyEmail";
import ResetPassword from "../pages/User/ResetPassword";
import { useAuth } from "../hooks/use-auth";
import type { UserRole } from "../types/user";
import { roleHome } from "../lib/auth-navigation";
import PropertyViewHistory from "../pages/User/PropertyViewHistory";
import { Skeleton, SkeletonStatus } from "../components/ui/skeleton";

function AccessRequired() {
  return <div className="min-h-screen bg-background">
    <Header page="/post" />
    <main className="container mx-auto max-w-xl px-4 py-12">
      <Card>
          <CardHeader><CardTitle><h1>Iniciá sesión para continuar</h1></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Esta sección está disponible para usuarios autenticados.</p>
          <AuthModals />
          <Button asChild variant="link"><Link to="/">Volver al catálogo</Link></Button>
        </CardContent>
      </Card>
    </main>
  </div>;
}

function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background"><Header page="/post" /><SkeletonStatus label="Restaurando sesión..." className="container mx-auto space-y-6 px-4 py-12"><Skeleton className="h-9 w-52" /><div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-64 rounded-2xl" />)}</div></SkeletonStatus></div>;
  return user ? <Outlet /> : <AccessRequired />;
}

function RequireRole({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return roles.includes(user.role) ? <Outlet /> : <Navigate to={roleHome(user.role)} replace />;
}

function LegacyPropertyDetailRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/detail/${id}` : "/detail"} replace />;
}

function App() {
  return (
    <Routes>
        <Route path="/" element={<HomePageWireframe />} />
        <Route path="/detail" element={<PropertyDetailPage />} />
        <Route path="/detail/:id" element={<PropertyDetailPage />} />
        <Route path="/HomePageLogin" element={<Navigate to="/" replace />} />
        <Route path="/detailLogin" element={<Navigate to="/detail" replace />} />
        <Route path="/detailLogin/:id" element={<LegacyPropertyDetailRedirect />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/register" element={<PublisherRegistration mode="visitor" />} />
        <Route path="/verificar-correo" element={<VerifyEmail />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireRole roles={["interested"]} />}>
            <Route path="/become-publisher" element={<PublisherRegistration mode="interested" />} />
          </Route>
          <Route element={<RequireRole roles={["interested", "publisher", "admin"]} />}>
            <Route path="/favorites" element={<Favorites />} />
          </Route>
          <Route element={<RequireRole roles={["interested", "publisher", "admin"]} />}>
            <Route path="/activity" element={<Activity />} />
            <Route path="/consultations" element={<Navigate to="/activity" replace />} />
            <Route path="/view-history" element={<PropertyViewHistory />} />
            <Route path="/search-alerts" element={<Navigate to="/activity?tab=alerts" replace />} />
          </Route>
          <Route element={<RequireRole roles={["publisher"]} />}>
            <Route path="/statistics" element={<Navigate to="/dashboard?tab=stats" replace />} />
            <Route path="/publisher/consultations" element={<Navigate to="/dashboard?tab=consultations" replace />} />
            <Route path="/dashboard" element={<PublisherDashboard />} />
            <Route path="/detailPublisher" element={<PropertyDetailPublisher />} />
            <Route path="/detailPublisher/:id" element={<PropertyDetailPublisher />} />
            <Route path="/editProperty" element={<EditProperty />} />
            <Route path="/editProperty/:id" element={<EditProperty />} />
            <Route path="/newProperty" element={<NewProperty />} />
          </Route>
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/properties/:id" element={<AdminPropertyDetail />} />
            <Route path="/admin/users" element={<Navigate to="/admin?tab=users" replace />} />
            <Route path="/admin/applications" element={<Navigate to="/admin?tab=applications" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
