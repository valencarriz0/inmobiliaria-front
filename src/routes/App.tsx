import { Routes, Route } from "react-router-dom";
import HomePageWireframe from "../pages/InteresedUser/HomePage";
import PropertyDetail from "../pages/InteresedUser/PropertyDetail";
import HomePageLogin from "../pages/InteresedUser/HomePageLogin";
import PropertyDetailLogin from "../pages/InteresedUser/PropertyDetailLogin";
import PostPage from "../pages/Publisher/PostPage";
import Registration from "../pages/Publisher/Registration";
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
      <Route path="/detail" element={<PropertyDetail />} />
      <Route path="/HomePageLogin" element={<HomePageLogin />} />
      <Route path="/detailLogin" element={<PropertyDetailLogin />} />
      <Route path="/post" element={<PostPage />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/dashboard" element={<PublisherDashboard />} />
      <Route path="/detailPublisher" element={<PropertyDetailPublisher />} />
      <Route path="/editProperty" element={<EditProperty />} />
      <Route path="/newProperty" element={<NewProperty />} />
    </Routes>
  );
}

export default App;
