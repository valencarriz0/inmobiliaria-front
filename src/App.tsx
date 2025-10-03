import { Routes, Route } from "react-router-dom";
import HomePageWireframe from "./pages/HomePage";
import PropertyDetail from "./pages/PropertyDetail";
import HomePageLogin from "./pages/HomePageLogin";
import PropertyDetailLogin from "./pages/PropertyDetailLogin";

function App() {
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<HomePageWireframe />} />

      {/* Página de detalle */}
      <Route path="/detail" element={<PropertyDetail />} />
      <Route path="/HomePageLogin" element={<HomePageLogin />} />
      <Route path="/detailLogin" element={<PropertyDetailLogin />} />
    </Routes>
  );
}

export default App;
