import PropertyDetail from "../../../components/PropertyDetail";
import HeaderUser from "../../../components/HeaderUser";

export default function PropertyDetailLogin() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Favoritos"
        menuItem3="Historial"
      />
      <PropertyDetail />
    </div>
  );
}
