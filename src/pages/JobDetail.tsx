import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useCurrentUser, getToken } from "../lib/auth";
import { JOB_TYPE_LABELS, StatusBadge } from "../components/StatusBadge";
import { JobDetailSkeleton } from "../components/LoadingSkeletons";
import SEO from "../components/SEO";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = id as Id<"jobs">;
  const job = useQuery(api.jobs.get, { id: jobId });
  const me = useCurrentUser();
  const token = getToken() ?? undefined;
  const myAppliedIds = useQuery(
    api.jobs.myApplicationJobIds,
    token && me?.role === "student" ? { token } : "skip",
  );
  const myApplications = useQuery(
    api.applications.listByStudent,
    token && me?.role === "student" ? { token } : "skip",
  );
  const apply = useMutation(api.applications.apply);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (job === undefined) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface">
        <div className="container-main py-12 md:py-16">
          <JobDetailSkeleton />
        </div>
      </div>
    );
  }
  if (job === null) {
    return (
      <div className="min-h-screen pt-[72px] container-main py-16">
        <p className="text-text-secondary">الوظيفة غير موجودة.</p>
        <Link to="/jobs" className="text-brand font-medium">العودة للوظائف</Link>
      </div>
    );
  }

  const alreadyApplied = myAppliedIds?.includes(jobId) ?? false;
  const myApp = myApplications?.find((a) => a.jobId === jobId);

  const onApply = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apply({ token, jobId });
    } catch (err) {
      const msg = err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "حدث خطأ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCta = () => {
    if (job.status !== "open") {
      return <p className="text-text-secondary">التقديم مغلق على هذه الوظيفة.</p>;
    }
    if (me === undefined) return null;
    if (me === null) {
      return (
        <Link to="/login?role=student" className="btn-primary inline-flex">
          سجّل دخولك للتقديم
        </Link>
      );
    }
    if (me.role === "company") return null;
    if (alreadyApplied) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-sm">حالة طلبك:</span>
          {myApp && <StatusBadge status={myApp.status} />}
        </div>
      );
    }
    return (
      <button
        onClick={onApply}
        disabled={submitting}
        className="btn-primary disabled:opacity-60"
      >
        {submitting ? "جاري التقديم..." : "قدّم الآن"}
      </button>
    );
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <SEO title={job.title} description={job.description?.slice(0, 160)} />
      <div className="container-main py-12 md:py-16">
        <Link to="/jobs" className="text-sm text-brand mb-6 inline-block">← كل الفرص</Link>
        <div className="bg-white rounded-3xl border border-border-light p-6 md:p-10 max-w-3xl">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <h1 className="text-h2">{job.title}</h1>
            <span className="text-xs px-3 py-1.5 rounded-full bg-brand/5 text-brand">
              {JOB_TYPE_LABELS[job.type]}
            </span>
          </div>
          <p className="text-text-secondary mb-1 flex items-center gap-2">
            <Link to={`/companies/${(job as any).companyId}`} className="hover:text-brand transition-colors">
              {job.companyName}
            </Link>
            {job.companyVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                موثّق
              </span>
            )}
          </p>
          <p className="text-text-secondary text-sm mb-6">{job.location}</p>

          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-text-primary mb-8">
            {job.description}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          {renderCta()}
        </div>
      </div>
    </div>
  );
}
