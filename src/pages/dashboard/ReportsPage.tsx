import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { Briefcase, FileText, Eye, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const token = getToken() ?? undefined;
  const jobs = useQuery(api.jobs.listByCompany, token ? { token } : "skip");

  if (!jobs) {
    return <p className="text-text-secondary">جاري التحميل...</p>;
  }

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const closedJobs = jobs.filter((j) => j.status === "closed").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  const stats = [
    { label: "إجمالي الوظائف", value: totalJobs, icon: Briefcase, color: "bg-blue-500" },
    { label: "وظائف مفتوحة", value: openJobs, icon: Eye, color: "bg-emerald-500" },
    { label: "وظائف مغلقة", value: closedJobs, icon: TrendingUp, color: "bg-amber-500" },
    { label: "إجمالي المتقدمين", value: totalApplicants, icon: FileText, color: "bg-violet-500" },
  ];

  return (
    <div>
      <h1 className="text-h2 mb-2">التقارير</h1>
      <p className="text-text-secondary mb-8">إحصائيات أداء وظائفك.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-border-light p-5">
              <span className={`w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </span>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border-light p-6">
        <h3 className="font-bold text-text-primary mb-4">ملخص الوظائف</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-text-secondary">لم تنشر أي وظيفة بعد.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="font-medium text-text-primary text-sm">{job.title}</p>
                  <p className="text-xs text-text-secondary">{job.applicantCount || 0} متقدّم</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  job.status === "open"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}>
                  {job.status === "open" ? "مفتوحة" : "مغلقة"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
