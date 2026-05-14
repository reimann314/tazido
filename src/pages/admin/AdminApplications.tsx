import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  reviewed: "تمت المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminApplications() {
  const token = getAdminToken() ?? undefined;
  const [statusFilter, setStatusFilter] = useState("");
  const apps = useQuery(api.admin.getApplications, {
    adminToken: token!,
    status: (statusFilter || undefined) as any,
  });
  const updateStatus = useMutation(api.admin.updateApplicationStatus);

  if (!apps) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleStatusChange = async (applicationId: any, newStatus: string) => {
    try {
      await updateStatus({ adminToken: token!, applicationId, status: newStatus as any });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["", "pending", "reviewed", "accepted", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              statusFilter === s
                ? "bg-brand text-white border-brand"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand/40"
            }`}
          >
            {s === "" ? "الكل" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          لا توجد طلبات
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الوظيفة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الطالب</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{app.jobId}</td>
                    <td className="px-4 py-3 text-gray-500">{app.studentId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[app.status] || ""}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(app.appliedAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:border-brand"
                      >
                        <option value="pending">قيد الانتظار</option>
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
        </div>
      )}
    </div>
  );
}
