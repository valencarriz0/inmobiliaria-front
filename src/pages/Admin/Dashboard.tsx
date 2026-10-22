import { useSearchParams } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import { AdminMetricsSection } from "./AdminMetricCards";
import { AdminPropertiesSection } from "./AdminPropertiesSection";
import { AdminUsersSection } from "./AdminSections";
import { AdminApplicationsSection } from "./AdminApplicationsSection";
import "../Publisher/HomePublisher.css";
import "./AdminDashboard.css";

const tabs = [
  ["publications", "Publicaciones"],
  ["users", "Usuarios"],
  ["applications", "Solicitudes de publicadores"],
] as const;
type AdminTab = (typeof tabs)[number][0];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: AdminTab = tabs.some(([tab]) => tab === requestedTab) ? requestedTab as AdminTab : "publications";
  const selectTab = (tab: AdminTab) => setSearchParams(tab === "publications" ? {} : { tab });

  return <div className="publisher-dashboard-page admin-dashboard-page">
    <HeaderUser />
    <main className="publisher-dashboard admin-dashboard">
      <AdminMetricsSection />
      <section className="publisher-workspace admin-workspace" aria-label="Gestión del panel administrador">
        <div className="publisher-tabs" role="tablist" aria-label="Secciones del panel administrador">
          {tabs.map(([tab, label]) => <button
            key={tab}
            id={`admin-tab-${tab}`}
            type="button"
            className={`publisher-tab ${activeTab === tab ? "is-selected" : ""}`}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="admin-tabpanel"
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => selectTab(tab)}
            onKeyDown={(event) => {
              const currentIndex = tabs.findIndex(([value]) => value === tab);
              const nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % tabs.length
                : event.key === "ArrowLeft" ? (currentIndex - 1 + tabs.length) % tabs.length
                  : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
              if (nextIndex !== -1) {
                event.preventDefault();
                const nextTab = tabs[nextIndex][0];
                selectTab(nextTab);
                document.getElementById(`admin-tab-${nextTab}`)?.focus();
              }
            }}
          >{label}</button>)}
        </div>
        <div className="admin-tabpanel" id="admin-tabpanel" role="tabpanel" aria-labelledby={`admin-tab-${activeTab}`}>
          {activeTab === "publications" && <AdminPropertiesSection />}
          {activeTab === "users" && <AdminUsersSection />}
          {activeTab === "applications" && <AdminApplicationsSection />}
        </div>
      </section>
    </main>
  </div>;
}
