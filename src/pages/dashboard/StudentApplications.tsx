import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { StatusBadge } from "../../components/StatusBadge";
import { TableSkeleton } from "../../components/LoadingSkeletons";

export default function StudentApplications() {
  const token = getToken() ?? undefined;
  const myApps = useQuery(
    api.applications.listByStudent,
    token ? { token } : "skip",
  );

  return (
    <div>
      <h1 className="text-h2 mb-2">طلباتي</h1>
      <p className="text-text-secondary mb-8">تتبع حالة طلباتك المقدمة على الوظائف.</p>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        {myApps === undefined ? (
          <TableSkeleton rows={3} />
        ) : myApps.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-secondary mb-4">لم تتقدّم لأي وظيفة بعد.</p>
            <Link to="/jobs" className="btn-primary inline-flex">
              تصفح الوظائف
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الوظيفة</th>
                  <th className="text-right px-4 py-3 font-medium">الشركة</th>
                  <th className="text-right px-4 py-3 font-medium">تاريخ التقديم</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map((app) => (
                  <tr key={app._id} className="border-t border-border-light">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${app.jobId}`} className="text-brand font-medium hover:underline">
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{app.companyName}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(app.appliedAt).toLocaleDateString("ar")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
