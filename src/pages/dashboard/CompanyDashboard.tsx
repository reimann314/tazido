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
    <div className="container-main py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-h2">{me.companyName ?? "شركتك"}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary"
        >
          {showForm ? "إلغاء" : "نشر وظيفة"}
        </button>
      </div>
      <p className="text-text-secondary mb-10">أدِر وظائفك ومتقدّميك من مكان واحد.</p>

      {showForm && token && (
        <JobForm token={token} onDone={() => setShowForm(false)} />
      )}

      <section className="mt-8">
        <h2 className="text-h3 mb-4">وظائفي</h2>
        {jobs === undefined ? (
          <p className="text-text-secondary">جاري التحميل...</p>
        ) : jobs.length === 0 ? (
          <p className="text-text-secondary">لم تنشر أي وظيفة بعد.</p>
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setSubmitting(true);
    setError(null);
    try {
      await create({
        token,
        title: data.title,
        description: data.description,
        location: data.location,
        type: data.type as JobType,
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
      <Field name="title" label="العنوان" required />
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">الوصف</span>
        <textarea
          name="description"
          required
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        />
      </label>
      <Field name="location" label="الموقع" required />
      <label className="block">
        <span className="block text-sm font-medium mb-1.5">النوع</span>
        <select
          name="type"
          required
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
        >
          <option value="internship">تدريب</option>
          <option value="full-time">دوام كامل</option>
          <option value="part-time">دوام جزئي</option>
        </select>
      </label>
      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? "جاري النشر..." : "نشر الوظيفة"}
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
    return <p className="px-5 pb-5 text-text-secondary text-sm">جاري التحميل...</p>;
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

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white"
      />
    </label>
  );
}
