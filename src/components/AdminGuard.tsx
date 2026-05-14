import { Navigate } from "react-router-dom";
import { useAdmin } from "../lib/admin-auth";
import type { ReactNode } from "react";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const admin = useAdmin();

  if (admin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (admin === null) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
