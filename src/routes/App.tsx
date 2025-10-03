import { Routes, Route } from "react-router-dom";
import HomePageWireframe from "../pages/InteresedUser/HomePage";
import PropertyDetail from "../pages/InteresedUser/PropertyDetail";
import HomePageLogin from "../pages/InteresedUser/HomePageLogin";
import PropertyDetailLogin from "../pages/InteresedUser/PropertyDetailLogin";
import PostPage from "../pages/Publisher/PostPage";
import Registration from "../pages/Publisher/Registration";

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
    </Routes>
  );
}

export default App;
