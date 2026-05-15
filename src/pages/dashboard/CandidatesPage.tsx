import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { StatusBadge } from "../../components/StatusBadge";
import { TableSkeleton } from "../../components/LoadingSkeletons";
import { FileText, ExternalLink } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type AppRow = {
  _id: Id<"applications">;
  studentName: string;
  studentEmail: string;
  jobTitle: string;
  jobId: Id<"jobs">;
  cvUrl: string | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
};

export default function CandidatesPage() {
  const token = getToken() ?? undefined;
  const jobs = useQuery(api.jobs.listByCompany, token ? { token } : "skip");
  const allApps = useQuery(api.applications.listByCompany, token ? { token } : "skip");
  const setStatus = useMutation(api.applications.setStatus);
  const [selectedJob, setSelectedJob] = useState("");

  if (!jobs || !allApps) {
    return <TableSkeleton rows={4} />;
  }

  const filtered = selectedJob
    ? allApps.filter((a) => a.jobId === selectedJob)
    : allApps;

  return (
    <div>
      <h1 className="text-h2 mb-2">المرشحون</h1>
      <p className="text-text-secondary mb-8">جميع المتقدمين على وظائفك.</p>

      {jobs.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedJob("")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              !selectedJob ? "bg-brand text-white border-brand" : "bg-white text-text-secondary border-border-light"
            }`}
          >
            الكل ({allApps.length})
          </button>
          {jobs.map((job) => {
            const count = allApps.filter((a) => a.jobId === job._id).length;
            return (
              <button
                key={job._id}
                onClick={() => setSelectedJob(job._id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                  selectedJob === job._id ? "bg-brand text-white border-brand" : "bg-white text-text-secondary border-border-light"
                }`}
              >
                {job.title} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-text-secondary text-center">لا يوجد مرشحون بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الطالب</th>
                  <th className="text-right px-4 py-3 font-medium">البريد</th>
                  <th className="text-right px-4 py-3 font-medium">الوظيفة</th>
                  <th className="text-right px-4 py-3 font-medium">السيرة الذاتية</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">تحديث</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app: AppRow) => (
                  <tr key={app._id} className="border-t border-border-light">
                    <td className="px-4 py-3 text-text-primary font-medium">{app.studentName}</td>
                    <td className="px-4 py-3 text-text-secondary">{app.studentEmail}</td>
                    <td className="px-4 py-3 text-text-secondary">{app.jobTitle}</td>
                    <td className="px-4 py-3">
                      {app.cvUrl ? (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-xs font-medium hover:bg-brand/20 transition-colors"
                        >
                          <FileText size={14} />
                          <span>عرض CV</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.status}
                        onChange={(e) => {
                          if (token) setStatus({ token, applicationId: app._id, status: e.target.value as AppRow["status"] });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-border-light bg-white text-sm"
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="reviewed">تمت المراجعة</option>
                        <option value="accepted">مقبول</option>
                        <option value="rejected">مرفوض</option>
                      </select>
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
