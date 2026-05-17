/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

export default function SavedJobsPage() {
  const token = getToken() ?? "";
  const saved = useQuery(api.savedJobs.list, token ? { token } : "skip");
  const unsaveJob = useMutation(api.savedJobs.remove);

  if (!saved) return <TableSkeleton rows={4} />;

  return (
    <div>
      <h1 className="text-h2 mb-2">الفرص المحفوظة</h1>
      <p className="text-text-secondary mb-8">الفرص التي حفظتها لمراجعتها لاحقاً.</p>

      {saved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Bookmark size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا توجد فرص محفوظة</p>
          <p className="text-sm text-text-muted">ابحث عن الفرص واحفظها لمراجعتها لاحقاً</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((job: any) => (
            <div key={job._id} className="bg-white rounded-2xl border border-border-light p-5 hover:border-brand/40 transition-all group relative">
              <Link to={`/jobs/${job._id}`} className="block">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-text-primary">{job.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-brand/5 text-brand whitespace-nowrap">
                    {job.type === "internship" ? "تدريب" : job.type === "full-time" ? "دوام كامل" : "دوام جزئي"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-1">{job.companyName}</p>
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <MapPin size={14} />
                  {job.location}
                </p>
              </Link>
              <button onClick={() => unsaveJob({ token, jobId: job._id })}
                className="absolute top-3 left-3 p-1.5 rounded-lg hover:bg-surface transition-colors">
                <BookmarkCheck size={16} className="text-brand" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
