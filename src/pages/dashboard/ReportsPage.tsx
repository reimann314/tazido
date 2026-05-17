import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { Briefcase, FileText, Eye, TrendingUp, Percent, Users } from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "../../components/LoadingSkeletons";

export default function ReportsPage() {
  const token = getToken() ?? undefined;
  const jobs = useQuery(api.jobs.listByCompany, token ? { token } : "skip");

  if (!jobs) {
    return (
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 7 }).map((_, i) => <StatsCardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={3} />
      </div>
    );
  }

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const closedJobs = jobs.filter((j) => j.status === "closed").length;
  const pendingJobs = jobs.filter((j) => j.status === "pending_approval").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
  const avgApplicantsPerJob = totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0;
  const jobsWithApplicants = jobs.filter((j) => (j.applicantCount || 0) > 0).length;
  const fillRate = totalJobs > 0 ? Math.round((jobsWithApplicants / totalJobs) * 100) : 0;

  const stats = [
    { label: "إجمالي الفرص", value: totalJobs, icon: Briefcase, color: "bg-blue-600" },
    { label: "مفتوحة", value: openJobs, icon: Eye, color: "bg-emerald-600" },
    { label: "مغلقة", value: closedJobs, icon: TrendingUp, color: "bg-amber-600" },
    { label: "قيد المراجعة", value: pendingJobs, icon: FileText, color: "bg-orange-500" },
    { label: "إجمالي المتقدمين", value: totalApplicants, icon: Users, color: "bg-violet-600" },
    { label: "متوسط لكل فرصة", value: avgApplicantsPerJob, icon: Percent, color: "bg-cyan-600" },
    { label: "نسبة الإقبال", value: `${fillRate}%`, icon: TrendingUp, color: "bg-rose-600" },
  ];

  return (
    <div>
      <h1 className="text-h2 mb-2">التقارير والإحصائيات</h1>
      <p className="text-text-secondary mb-8">نظرة شاملة على أداء فرصك والمتقدمين.</p>

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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-brand" />
            توزيع الفرص
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">مفتوحة</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalJobs > 0 ? (openJobs / totalJobs) * 100 : 0}%` }} />
                </div>
                <span className="text-text-primary font-medium w-8 text-left">{totalJobs > 0 ? Math.round((openJobs / totalJobs) * 100) : 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">مغلقة</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalJobs > 0 ? (closedJobs / totalJobs) * 100 : 0}%` }} />
                </div>
                <span className="text-text-primary font-medium w-8 text-left">{totalJobs > 0 ? Math.round((closedJobs / totalJobs) * 100) : 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">قيد المراجعة</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${totalJobs > 0 ? (pendingJobs / totalJobs) * 100 : 0}%` }} />
                </div>
                <span className="text-text-primary font-medium w-8 text-left">{totalJobs > 0 ? Math.round((pendingJobs / totalJobs) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border-light p-6">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users size={18} className="text-brand" />
            أداء المتقدمين
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">إجمالي المتقدمين</span>
              <span className="text-text-primary font-medium">{totalApplicants}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">متوسط لكل فرصة</span>
              <span className="text-text-primary font-medium">{avgApplicantsPerJob}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">الفرص التي وصلها متقدمون</span>
              <span className="text-text-primary font-medium">{jobsWithApplicants} من {totalJobs}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">نسبة الإقبال</span>
              <span className="text-text-primary font-medium">{fillRate}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border-light p-6">
        <h3 className="font-bold text-text-primary mb-4">تفاصيل الفرص</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-text-secondary">لم تنشر أي فرصة بعد.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div>
                  <p className="font-medium text-text-primary text-sm">{job.title}</p>
                  <p className="text-xs text-text-secondary">{job.applicantCount || 0} متقدّم</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    job.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : job.status === "pending_approval" ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}>
                    {job.status === "open" ? "مفتوحة" : job.status === "pending_approval" ? "قيد المراجعة" : "مغلقة"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
