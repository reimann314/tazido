import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JOB_TYPE_LABELS } from "../components/StatusBadge";

type JobType = "all" | "internship" | "full-time" | "part-time";

export default function Jobs() {
  const [filter, setFilter] = useState<JobType>("all");
  const jobs = useQuery(api.jobs.list, {});

  const filtered = jobs?.filter((j) => filter === "all" || j.type === filter) ?? [];

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="container-main py-12 md:py-16">
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

        {jobs === undefined ? (
          <p className="text-text-secondary">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-secondary">لا توجد وظائف متاحة حالياً.</p>
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
                  <span className="text-xs px-2 py-1 rounded-full bg-brand/5 text-brand whitespace-nowrap">
                    {JOB_TYPE_LABELS[job.type]}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-1">{job.companyName}</p>
                <p className="text-sm text-text-secondary">{job.location}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
