/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JOB_TYPE_LABELS } from "../components/StatusBadge";
import { CardSkeleton } from "../components/LoadingSkeletons";
import SEO from "../components/SEO";
import { getToken } from "../lib/auth";
import { Search, Bookmark, BookmarkCheck } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type JobType = "all" | "internship" | "full-time" | "part-time";

export default function Jobs() {
  const token = getToken() ?? "";
  const [filter, setFilter] = useState<JobType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const results = usePaginatedQuery(api.jobs.list, {}, { initialNumItems: 12 });
  const allJobs = results.results ?? [];

  const q = debouncedSearch.toLowerCase();
  const filtered = allJobs.filter((j) => {
    if (filter !== "all" && j.type !== filter) return false;
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  const saveJob = useMutation(api.savedJobs.add);
  const unsaveJob = useMutation(api.savedJobs.remove);
  const savedJobs = useQuery(api.savedJobs.list, token ? { token } : "skip");
  const savedIds = new Set((savedJobs || []).map((j: any) => j._id));

  const handleToggleSave = async (e: React.MouseEvent, jobId: Id<"jobs">, isSaved: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    if (isSaved) await unsaveJob({ token, jobId });
    else await saveJob({ token, jobId });
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="container-main py-12 md:py-16">
        <SEO title="الفرص المتاحة" description="تصفّح أحدث الفرص التدريبية والمهنية للطلاب في السعودية." />
        <h1 className="text-h2 mb-2">الفرص المتاحة</h1>
        <p className="text-text-secondary mb-8">تصفّح أحدث الفرص وقدّم مباشرة.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، الشركة، أو الموقع..."
              className="w-full pr-12 pl-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "internship", "full-time", "part-time"] as JobType[]).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === t ? "border-brand bg-brand text-white" : "border-border-light text-text-secondary hover:border-brand/40"
              }`}>
              {t === "all" ? "الكل" : JOB_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {results.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
            <Search size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-text-secondary font-medium mb-1">لا توجد نتائج</p>
            <p className="text-sm text-text-muted">حاول تغيير كلمات البحث أو تصفّح جميع الفرص</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => {
              const isSaved = savedIds.has(job._id);
              return (
                <Link key={job._id} to={`/jobs/${job._id}`}
                  className="block bg-white rounded-2xl border border-border-light p-5 hover:border-brand/40 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-text-primary flex-1">{job.title}</h3>
                    <button onClick={(e) => handleToggleSave(e, job._id, isSaved)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-surface transition-colors opacity-0 group-hover:opacity-100">
                      {isSaved ? <BookmarkCheck size={16} className="text-brand" /> : <Bookmark size={16} className="text-text-muted" />}
                    </button>
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
              );
            })}
          </div>
        )}

        {results.status === "CanLoadMore" && (
          <div className="mt-10 text-center">
            <button onClick={() => results.loadMore(12)}
              className="px-8 py-3 rounded-full bg-white border border-border-light text-text-secondary font-medium hover:border-brand/40 hover:text-brand transition-all">
              عرض المزيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
