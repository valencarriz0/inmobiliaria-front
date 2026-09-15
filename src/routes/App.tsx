import { useState } from "react";
import { Routes, Route, Outlet, Navigate, Link } from "react-router-dom";
import HomePageWireframe from "../pages/InteresedUser/Sin Login/HomePage";
import PropertyDetailPage from "../pages/InteresedUser/Sin Login/PropertyDetailPage";
import HomePageLogin from "../pages/InteresedUser/Con Login/HomePageLogin";
import PropertyDetailLogin from "../pages/InteresedUser/Con Login/PropertyDetailLogin";
import PostPage from "../pages/Publisher/PostPage";
import PublisherRegistration from "../pages/Publisher/Registration";
import PublisherDashboard from "../pages/Publisher/HomePublisher";
import PropertyDetailPublisher from "../pages/Publisher/PropertyDetailPublisher";
import EditProperty from "../pages/Publisher/EditProperty";
import NewProperty from "../pages/Publisher/NewProperty";
import Profile from "../pages/User/Profile";
import AdminDashboard from "../pages/Admin/Dashboard";
import Header from "../components/Header";
import AuthModals from "../components/Modals/AuthModals";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { UserPreviewContext } from "../hooks/use-user-preview";
import type { UserProfile } from "../types/user";
import Favorites from "../pages/User/Favorites";
import Consultations from "../pages/User/Consultations";
import Statistics from "../pages/Publisher/Statistics";
import type { Property } from "../types/property";
import { canFavoriteProperty, canUseInterestedFeatures } from "../lib/user-properties";
import type { AuthDialog } from "../hooks/use-user-preview";

function PreviewAccess() {
  return <div className="min-h-screen bg-background">
    <Header page="/post" />
    <main className="container mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardHeader><CardTitle><h1>Explorar las pantallas de usuario</h1></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Abrí Acceder y elegí una vista de ejemplo de interesado, publicador o administrador. El inicio de sesión todavía no está disponible.</p>
          <AuthModals />
          <Button asChild variant="link"><Link to="/">Volver al catálogo</Link></Button>
        </CardContent>
      </Card>
    </main>
  </div>;
}

function App() {
  // Este estado permite recorrer las pantallas; no autentica ni persiste usuarios.
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authDialog, setAuthDialog] = useState<AuthDialog | null>(null);
  const [favorites, setFavorites] = useState<Record<string, string[]>>({});
  const favoriteIds = user ? favorites[user.email] ?? [] : [];
  const toggleFavorite = (property: Pick<Property, "id" | "publisherId">) => {
    if (!user || !canFavoriteProperty(user, property)) return;
    const propertyId = property.id;
    setFavorites((previous) => {
      const ids = previous[user.email] ?? [];
      return { ...previous, [user.email]: ids.includes(propertyId) ? ids.filter((id) => id !== propertyId) : [...ids, propertyId] };
    });
  };
  const openAuthDialog = (dialog: Exclude<typeof authDialog, null>) => setAuthDialog(dialog);
  return (
    <UserPreviewContext.Provider value={{ user, setUser, favoriteIds, toggleFavorite, authDialog, setAuthDialog, openAuthDialog }}>
      <Routes>
        <Route path="/" element={<HomePageWireframe />} />
        <Route path="/detail" element={<PropertyDetailPage />} />
        <Route path="/detail/:id" element={<PropertyDetailPage />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/register" element={<PublisherRegistration />} />
        <Route element={user ? <Outlet /> : <PreviewAccess />}>
          <Route path="/HomePageLogin" element={<HomePageLogin />} />
          <Route path="/detailLogin" element={<PropertyDetailLogin />} />
          <Route path="/detailLogin/:id" element={<PropertyDetailLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/become-publisher" element={<PublisherRegistration />} />
          <Route element={canUseInterestedFeatures(user) ? <Outlet /> : <Navigate to="/profile" replace />}>
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/consultations" element={<Consultations />} />
          </Route>
          <Route element={user?.role === "publisher" ? <Outlet /> : <Navigate to="/profile" replace />}>
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/publisher/consultations" element={<Consultations publisher />} />
            <Route path="/dashboard" element={<PublisherDashboard />} />
            <Route path="/detailPublisher" element={<PropertyDetailPublisher />} />
            <Route path="/detailPublisher/:id" element={<PropertyDetailPublisher />} />
            <Route path="/editProperty" element={<EditProperty />} />
            <Route path="/editProperty/:id" element={<EditProperty />} />
            <Route path="/newProperty" element={<NewProperty />} />
          </Route>
          <Route path="/admin" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/profile" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserPreviewContext.Provider>
  );
}

export default App;
