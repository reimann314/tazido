import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { clearAdminToken, getAdminToken, useAdmin } from "../../lib/admin-auth";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, FileText, LogOut, Menu, X, Shield,
} from "lucide-react";

type AdminPage = "dashboard" | "users" | "jobs" | "applications";

export default function AdminLayout({
  page,
  onPageChange,
  children,
}: {
  page: AdminPage;
  onPageChange: (p: AdminPage) => void;
  children: React.ReactNode;
}) {
  const admin = useAdmin();
  const navigate = useNavigate();
  const logout = useMutation(api.admin.adminLogout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links: { label: string; key: AdminPage; icon: React.ReactNode }[] = [
    { label: "الإحصائيات", key: "dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "المستخدمين", key: "users", icon: <Users size={18} /> },
    { label: "الوظائف", key: "jobs", icon: <Briefcase size={18} /> },
    { label: "الطلبات", key: "applications", icon: <FileText size={18} /> },
  ];

  const onLogout = async () => {
    const token = getAdminToken();
    if (token) try { await logout({ token }); } catch { /* */ }
    clearAdminToken();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 bottom-0 z-50 w-64 bg-white border-l border-gray-200 flex flex-col lg:static lg:flex ${sidebarOpen ? "" : "hidden lg:flex"}`}>
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Shield size={20} />
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">الإدارة</p>
                <p className="text-xs text-gray-500">{admin?.displayName || ""}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.key}
              onClick={() => { onPageChange(link.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-right ${
                page === link.key
                  ? "bg-brand text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className={page === link.key ? "text-white" : "text-brand/70"}>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} className="text-red-400" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu size={20} className="text-gray-600" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900">
            {links.find((l) => l.key === page)?.label}
          </h2>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
