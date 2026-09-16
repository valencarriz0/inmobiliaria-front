import HeaderUser from "../../components/HeaderUser";
import { AdminMetricsSection } from "./AdminSections";
import { AdminPropertiesSection } from "./AdminPropertiesSection";

export default function AdminDashboard() {
  return <div className="min-h-screen bg-background"><HeaderUser /><main className="container mx-auto px-4 py-8"><AdminMetricsSection /><AdminPropertiesSection /></main></div>;
}
