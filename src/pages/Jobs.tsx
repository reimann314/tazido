import { useState } from "react";
import { Link } from "react-router-dom";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JOB_TYPE_LABELS } from "../components/StatusBadge";
import { CardSkeleton } from "../components/LoadingSkeletons";
import SEO from "../components/SEO";

type JobType = "all" | "internship" | "full-time" | "part-time";

export default function Jobs() {
  const [filter, setFilter] = useState<JobType>("all");
  const results = usePaginatedQuery(
    api.jobs.list,
    {},
    { initialNumItems: 12 },
  );

  const allJobs = results.results ?? [];
  const filtered = allJobs.filter((j) => filter === "all" || j.type === filter);

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="container-main py-12 md:py-16">
        <SEO title="الوظائف المتاحة" description="تصفّح أحدث الفرص التدريبية والوظيفية للطلاب في السعودية. قدّم مباشرة على وظائف تناسب تخصصك." />
        <h1 className="text-h2 mb-2">الوظائف المتاحة</h1>
        <p className="text-text-secondary mb-8">تصفّح أحدث الفرص وقدّم مباشرة.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "internship", "full-time", "part-time"] as JobType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === t
                  ? "border-brand bg-brand text-white"
                  : "border-border-light text-text-secondary hover:border-brand/40"
              }`}
            >
              {t === "all" ? "الكل" : JOB_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {results.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : allJobs.length === 0 ? (
          <p className="text-text-secondary">قيد التحديث — الفرص متاحة حالياً لعدد محدود من المستخدمين، وسيتم فتحها للجميع قريباً.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="block bg-white rounded-2xl border border-border-light p-5 hover:border-brand/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-text-primary">{job.title}</h3>
                  {job.companyVerified && (
                    <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      موثّق
                    </span>
                  )}
                  <span className="text-xs px-2 py-1 rounded-full bg-brand/5 text-brand whitespace-nowrap">
                    {JOB_TYPE_LABELS[job.type]}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-1">
                  <Link to={`/companies/${(job as any).companyId}`} onClick={(e) => e.stopPropagation()} className="hover:text-brand transition-colors">
                    {job.companyName}
                  </Link>
                </p>
                <p className="text-sm text-text-secondary">{job.location}</p>
              </Link>
            ))}
          </div>
        )}

        {results.status === "CanLoadMore" && (
          <div className="mt-10 text-center">
            <button
              onClick={() => results.loadMore(12)}
              className="px-8 py-3 rounded-full bg-white border border-border-light text-text-secondary font-medium hover:border-brand/40 hover:text-brand transition-all"
            >
              عرض المزيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
