import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getToken } from "../../lib/auth";
import {
  JOB_TYPE_LABELS,
  JobStatusBadge,
  StatusBadge,
} from "../../components/StatusBadge";
import { TableSkeleton } from "../../components/LoadingSkeletons";
import DescriptionHelper from "../../components/DescriptionHelper";

type Me = { name?: string; companyName?: string };
type JobType = "internship" | "full-time" | "part-time";
type AppStatus = "pending" | "reviewed" | "accepted" | "rejected";

export default function CompanyDashboard({ me }: { me: Me }) {
  const token = getToken() ?? undefined;
  const jobs = useQuery(
    api.jobs.listByCompany,
    token ? { token } : "skip",
  );
  const [showForm, setShowForm] = useState(false);
  const [openJobId, setOpenJobId] = useState<Id<"jobs"> | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-h2">{me.companyName ?? "شركتك"}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          {showForm ? "إلغاء" : "نشر فرصة"}
        </button>
      </div>
      <p className="text-text-secondary mb-10">أدِر فرصك ومتقدّميك من مكان واحد.</p>

      {showForm && token && (
        <JobForm token={token} onDone={() => setShowForm(false)} />
      )}

      <section className="mt-8">
        <h2 className="text-h3 mb-4">فرصي</h2>
        {jobs === undefined ? (
          <TableSkeleton rows={3} />
        ) : jobs.length === 0 ? (
          <p className="text-text-secondary bg-white rounded-2xl border border-border-light p-6">لم تنشر أي فرصة بعد.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobRow
                key={job._id}
                job={job}
                token={token!}
                expanded={openJobId === job._id}
                onToggle={() =>
                  setOpenJobId((v) => (v === job._id ? null : job._id))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function JobForm({ token, onDone }: { token: string; onDone: () => void }) {
  const create = useMutation(api.jobs.create);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<JobType>("internship");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await create({
        token,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        type,
      });
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "حدث خطأ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-border-light p-6 space-y-4"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">العنوان *</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        />
      </label>
      <label className="block">
        <div className="flex items-center justify-between mb-1.5">
          <span className="block text-sm font-medium">الوصف *</span>
          <DescriptionHelper onSelect={(text) => setDescription(text)} />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">الموقع *</span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">النوع</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as JobType)}
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        >
          <option value="internship">تدريب</option>
          <option value="full-time">دوام كامل</option>
          <option value="part-time">دوام جزئي</option>
        </select>
      </label>
      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? "جاري النشر..." : "نشر الفرصة"}
      </button>
    </form>
  );
}

type JobRowProps = {
  job: {
    _id: Id<"jobs">;
    title: string;
    type: JobType;
    status: "open" | "closed";
    location: string;
    applicantCount: number;
  };
  token: string;
  expanded: boolean;
  onToggle: () => void;
};

function JobRow({ job, token, expanded, onToggle }: JobRowProps) {
  const setStatus = useMutation(api.jobs.setStatus);

  return (
    <div className="bg-white rounded-2xl border border-border-light">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{job.title}</h3>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-sm text-text-secondary">
            {JOB_TYPE_LABELS[job.type]} • {job.location} • {job.applicantCount} متقدّم
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setStatus({
                token,
                jobId: job._id,
                status: job.status === "open" ? "closed" : "open",
              })
            }
            className="text-sm px-3 py-2 rounded-full border border-border-light hover:border-brand/40"
          >
            {job.status === "open" ? "إغلاق" : "إعادة فتح"}
          </button>
          <button
            onClick={onToggle}
            className="text-sm px-3 py-2 rounded-full bg-brand text-white"
          >
            {expanded ? "إخفاء" : "عرض المتقدّمين"}
          </button>
        </div>
      </div>
      {expanded && <Applicants jobId={job._id} token={token} />}
    </div>
  );
}

function Applicants({ jobId, token }: { jobId: Id<"jobs">; token: string }) {
  const applicants = useQuery(api.applications.listByJob, { token, jobId });
  const setStatus = useMutation(api.applications.setStatus);

  if (applicants === undefined) {
    return <div className="px-5 pb-5"><TableSkeleton rows={2} /></div>;
  }
  if (applicants.length === 0) {
    return <p className="px-5 pb-5 text-text-secondary text-sm">لا يوجد متقدّمون بعد.</p>;
  }

  return (
    <div className="border-t border-border-light overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface text-text-secondary">
          <tr>
            <th className="text-right px-4 py-3 font-medium">الاسم</th>
            <th className="text-right px-4 py-3 font-medium">البريد</th>
            <th className="text-right px-4 py-3 font-medium">الجامعة</th>
            <th className="text-right px-4 py-3 font-medium">الحالة</th>
            <th className="text-right px-4 py-3 font-medium">تحديث</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((a) => (
            <tr key={a._id} className="border-t border-border-light">
              <td className="px-4 py-3">{a.studentName}</td>
              <td className="px-4 py-3 text-text-secondary">{a.studentEmail}</td>
              <td className="px-4 py-3 text-text-secondary">{a.university || "—"}</td>
              <td className="px-4 py-3">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-4 py-3">
                <select
                  value={a.status}
                  onChange={(e) =>
                    setStatus({
                      token,
                      applicationId: a._id,
                      status: e.target.value as AppStatus,
                    })
                  }
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
  );
}


