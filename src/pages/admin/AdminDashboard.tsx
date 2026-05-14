import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import { Users, Briefcase, FileText, Shield, UserCheck, Building2, GraduationCap } from "lucide-react";

export default function AdminDashboard() {
  const token = getAdminToken() ?? undefined;
  const stats = useQuery(api.admin.getDashboardStats, { adminToken: token! });

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { label: "الطلاب", value: stats.totalStudents, icon: GraduationCap, color: "bg-emerald-500" },
    { label: "الشركات", value: stats.totalCompanies, icon: Building2, color: "bg-violet-500" },
    { label: "المؤكدين", value: stats.verifiedUsers, icon: UserCheck, color: "bg-green-500" },
    { label: "الوظائف المنشورة", value: stats.totalJobs, icon: Briefcase, color: "bg-amber-500" },
    { label: "وظائف مفتوحة", value: stats.openJobs, icon: Briefcase, color: "bg-orange-500" },
    { label: "الطلبات", value: stats.totalApplications, icon: FileText, color: "bg-rose-500" },
    { label: "قيد المراجعة", value: stats.pendingApplications, icon: Shield, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`w-10 h-10 rounded-xl ${card.color} bg-opacity-10 flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
