import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../lib/auth";
import type { ReactNode } from "react";

export default function RedirectIfAuth({ children }: { children: ReactNode }) {
  const me = useCurrentUser();

  if (me === undefined) return null;
  if (me) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
