import { useCurrentUser } from "../../lib/auth";
import StudentDashboard from "./StudentDashboard";
import CompanyDashboard from "./CompanyDashboard";

export default function Dashboard() {
  const me = useCurrentUser();
  if (!me) return null;

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      {me.role === "student" ? (
        <StudentDashboard me={me} />
      ) : (
        <CompanyDashboard me={me} />
      )}
    </div>
  );
}
