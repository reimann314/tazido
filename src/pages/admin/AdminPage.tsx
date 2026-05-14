import { useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminJobs from "./AdminJobs";
import AdminApplications from "./AdminApplications";

type AdminPage = "dashboard" | "users" | "jobs" | "applications";

export default function AdminPage() {
  const [page, setPage] = useState<AdminPage>("dashboard");

  const renderContent = () => {
    switch (page) {
      case "users": return <AdminUsers />;
      case "jobs": return <AdminJobs />;
      case "applications": return <AdminApplications />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout page={page} onPageChange={setPage}>
      {renderContent()}
    </AdminLayout>
  );
}
