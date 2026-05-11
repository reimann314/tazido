import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../lib/auth";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const me = useCurrentUser();

  if (me === undefined) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center text-text-secondary">
        جاري التحميل...
      </div>
    );
  }
  if (me === null) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
