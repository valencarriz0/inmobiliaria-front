import { useSearchParams } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import Consultations from "./Consultations";
import SearchAlerts from "./SearchAlerts";
import "../Publisher/HomePublisher.css";

const tabs = [
  { value: "consultations", label: "Mis consultas" },
  { value: "alerts", label: "Mis alertas" },
] as const;

type ActivityTab = typeof tabs[number]["value"];

export default function Activity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: ActivityTab = searchParams.get("tab") === "alerts" ? "alerts" : "consultations";

  const selectTab = (tab: ActivityTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "consultations") nextParams.delete("tab");
    else nextParams.set("tab", tab);
    setSearchParams(nextParams);
  };

  return (
    <div className="publisher-dashboard-page">
      <HeaderUser />
      <main className="publisher-dashboard user-consultations-dashboard">
        <section className="publisher-workspace" aria-label="Mi actividad">
          <div className="publisher-tabs" role="tablist" aria-label="Secciones de mi actividad">
            {tabs.map(({ value, label }, index) => (
              <button
                key={value}
                id={`activity-tab-${value}`}
                type="button"
                role="tab"
                aria-selected={activeTab === value}
                aria-controls="activity-tabpanel"
                tabIndex={activeTab === value ? 0 : -1}
                className={`publisher-tab ${activeTab === value ? "is-selected" : ""}`}
                onClick={() => selectTab(value)}
                onKeyDown={(event) => {
                  const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabs.length
                    : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
                    : event.key === "Home" ? 0
                    : event.key === "End" ? tabs.length - 1 : -1;
                  if (nextIndex === -1) return;
                  event.preventDefault();
                  selectTab(tabs[nextIndex].value);
                  document.getElementById(`activity-tab-${tabs[nextIndex].value}`)?.focus();
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="publisher-tabpanel" id="activity-tabpanel" role="tabpanel" aria-labelledby={`activity-tab-${activeTab}`} tabIndex={0}>
            {activeTab === "consultations" ? <Consultations /> : <SearchAlerts />}
          </div>
        </section>
      </main>
    </div>
  );
}
