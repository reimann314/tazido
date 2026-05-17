import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import type { Id } from "../../../convex/_generated/dataModel";

export default function AdminJobs() {
  const token = getAdminToken() ?? undefined;
  const [tab, setTab] = useState<"all" | "pending">("all");

  const allJobs = useQuery(api.admin.getJobs, { adminToken: token! });
  const pendingJobs = useQuery(api.admin.getPendingJobs, { adminToken: token! });
  const updateStatus = useMutation(api.admin.updateJobStatus);
  const deleteJob = useMutation(api.admin.deleteJob);

  const toggleStatus = async (jobId: Id<"jobs">, current: string) => {
    try {
      await updateStatus({
        adminToken: token!,
        jobId,
        status: current === "open" ? "closed" : "open",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  const handleApprove = async (jobId: Id<"jobs">) => {
    try {
      await updateStatus({ adminToken: token!, jobId, status: "open" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  const handleDelete = async (jobId: Id<"jobs">) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفرصة؟")) return;
    try {
      await deleteJob({ adminToken: token!, jobId });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            tab === "all" ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all relative ${
            tab === "pending" ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          قيد المراجعة
          {pendingJobs && pendingJobs.length > 0 && (
            <span className="mr-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
              {pendingJobs.length}
            </span>
          )}
        </button>
      </div>

      {tab === "pending" ? (
        !pendingJobs ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
            لا توجد فرص قيد المراجعة
          </div>
        ) : (
          <div className="space-y-3">
            {pendingJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.companyName} • {job.type === "internship" ? "تدريب" : job.type === "full-time" ? "دوام كامل" : "دوام جزئي"} • {job.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{job.companyEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(job._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      موافقة
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {!allJobs ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">لا توجد فرص</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-right px-4 py-3 font-medium text-gray-600">العنوان</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">النوع</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">المكان</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {allJobs.map((job) => (
                    <tr key={job._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{job.title}</td>
                      <td className="px-4 py-3 text-gray-500">{job.type === "internship" ? "تدريب" : job.type === "full-time" ? "دوام كامل" : "دوام جزئي"}</td>
                      <td className="px-4 py-3 text-gray-500">{job.location}</td>
                      <td className="px-4 py-3">
                        {job.status === "pending_approval" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                            قيد المراجعة
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleStatus(job._id, job.status)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                              job.status === "open"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {job.status === "open" ? "مفتوحة" : "مغلقة"}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(job._creationTime).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <button onClick={() => handleDelete(job._id)} className="text-red-500 text-xs font-medium hover:underline">
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
