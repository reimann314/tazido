import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";

export default function AdminJobs() {
  const token = getAdminToken() ?? undefined;
  const jobs = useQuery(api.admin.getJobs, { adminToken: token! });
  const updateStatus = useMutation(api.admin.updateJobStatus);
  const deleteJob = useMutation(api.admin.deleteJob);

  if (!jobs) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
        لا توجد وظائف
      </div>
    );
  }

  const toggleStatus = async (jobId: any, current: string) => {
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

  const handleDelete = async (jobId: any) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;
    try {
      await deleteJob({ adminToken: token!, jobId });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            {jobs.map((job) => (
              <tr key={job._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{job.title}</td>
                <td className="px-4 py-3 text-gray-500">{job.type}</td>
                <td className="px-4 py-3 text-gray-500">{job.location}</td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(job._creationTime).toLocaleDateString("ar-SA")}
                </td>
                <td className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="text-red-500 text-xs font-medium hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
