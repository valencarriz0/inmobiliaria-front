import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<HomePageWireframe />} />

      {/* Página de detalle */}
      <Route path="/detail" element={<PropertyDetailPage />} />
      <Route path="/detail/:id" element={<PropertyDetailPage />} />
      <Route path="/HomePageLogin" element={<HomePageLogin />} />
      <Route path="/detailLogin" element={<PropertyDetailLogin />} />
      <Route path="/detailLogin/:id" element={<PropertyDetailLogin />} />
      <Route path="/post" element={<PostPage />} />
      <Route path="/register" element={<PublisherRegistration />} />
      <Route path="/dashboard" element={<PublisherDashboard />} />
      <Route path="/detailPublisher" element={<PropertyDetailPublisher />} />
      <Route
        path="/detailPublisher/:id"
        element={<PropertyDetailPublisher />}
      />
      <Route path="/editProperty" element={<EditProperty />} />
      <Route path="/newProperty" element={<NewProperty />} />
    </Routes>
  );
}

export default App;
