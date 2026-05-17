import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import {
  JOB_TYPE_LABELS,
  StatusBadge,
} from "../../components/StatusBadge";
import { CardSkeleton, TableSkeleton } from "../../components/LoadingSkeletons";

const MATCH_SCORE_PER_POINT = 20; // matchScore range: 0-5, displayed as 0-100%

type Me = {
  name?: string;
};

export default function StudentDashboard({ me }: { me: Me }) {
  const token = getToken() ?? undefined;
  const recommended = useQuery(api.jobs.listSuggested, token ? { token, limit: 6 } : "skip");
  const myApps = useQuery(
    api.applications.listByStudent,
    token ? { token } : "skip",
  );

  return (
    <div>
      <h1 className="text-h2 mb-2">أهلاً، {me.name ?? "طالب"}</h1>
      <p className="text-text-secondary mb-10">تابع طلباتك واكتشف فرصاً جديدة.</p>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3">الفرص المقترحة</h2>
          <Link to="/jobs" className="text-sm text-brand font-medium">
            عرض الكل
          </Link>
        </div>
        {recommended === undefined ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recommended.length === 0 ? (
          <p className="text-text-secondary">لا توجد فرص حالياً.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block bg-white rounded-2xl border border-border-light p-5 hover:border-brand/40 transition-all"
              >
                <h3 className="font-semibold mb-2">{job.title}</h3>
                <p className="text-sm text-text-secondary mb-1">{job.companyName}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-text-secondary">{job.location}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-brand/5 text-brand">
                    {JOB_TYPE_LABELS[job.type]}
                  </span>
                </div>
                {job.matchScore > 0 && (
                  <div className="mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      نسبة تطابق {Math.min(100, job.matchScore * MATCH_SCORE_PER_POINT)}%
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 mb-4">طلباتي</h2>
        {myApps === undefined ? (
          <TableSkeleton rows={3} />
        ) : myApps.length === 0 ? (
          <p className="text-text-secondary p-6 bg-white rounded-2xl border border-border-light">لم تتقدّم لأي فرصة بعد.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الفرصة</th>
                  <th className="text-right px-4 py-3 font-medium">الشركة</th>
                  <th className="text-right px-4 py-3 font-medium">تاريخ التقديم</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map((app) => (
                  <tr key={app._id} className="border-t border-border-light">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${app.jobId}`} className="text-brand">
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
      </section>
    </div>
  );
}
