import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import {
  JOB_TYPE_LABELS,
  StatusBadge,
} from "../../components/StatusBadge";

type Me = {
  name?: string;
  companyName?: string;
};

export default function StudentDashboard({ me }: { me: Me }) {
  const token = getToken() ?? undefined;
  const recommended = useQuery(api.jobs.list, { limit: 6 });
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
          <h2 className="text-h3">وظائف مقترحة</h2>
          <Link to="/jobs" className="text-sm text-brand font-medium">
            عرض الكل
          </Link>
        </div>
        {recommended === undefined ? (
          <p className="text-text-secondary">جاري التحميل...</p>
        ) : recommended.length === 0 ? (
          <p className="text-text-secondary">لا توجد وظائف حالياً.</p>
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
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h3 mb-4">طلباتي</h2>
        <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
          {myApps === undefined ? (
            <p className="p-6 text-text-secondary">جاري التحميل...</p>
          ) : myApps.length === 0 ? (
            <p className="p-6 text-text-secondary">لم تتقدّم لأي وظيفة بعد.</p>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}
