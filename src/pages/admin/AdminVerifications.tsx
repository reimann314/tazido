import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getAdminToken } from "../../lib/admin-auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { BadgeCheck, XCircle, Building2, Mail, Calendar } from "lucide-react";

export default function AdminVerifications() {
  const token = getAdminToken() ?? undefined;
  const requests = useQuery(api.admin.getVerificationRequests, { adminToken: token! });
  const updateUser = useMutation(api.admin.updateUser);
  const [actionId, setActionId] = useState<Id<"users"> | null>(null);

  const handleVerify = async (userId: Id<"users">) => {
    setActionId(userId);
    try {
      await updateUser({ adminToken: token!, userId, updates: { verified: true } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (userId: Id<"users">) => {
    if (!confirm("هل أنت متأكد من رفض طلب التوثيق؟")) return;
    setActionId(userId);
    try {
      await updateUser({ adminToken: token!, userId, updates: { verified: false } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setActionId(null);
    }
  };

  if (!requests) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">طلبات التوثيق</h2>
          <p className="text-sm text-gray-500 mt-1">
            {requests.length} شركة تنتظر التوثيق
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <BadgeCheck size={48} className="mx-auto mb-4 text-green-400" />
          <p className="text-gray-900 font-medium mb-1">جميع الشركات موثّقة</p>
          <p className="text-sm text-gray-500">لا توجد طلبات توثيق جديدة</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((company) => (
            <div key={company._id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <span className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Building2 size={24} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{company.companyName || "—"}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                      بانتظار التوثيق
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                    {company.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} />
                        {company.email}
                      </span>
                    )}
                    {company.contactNumber && (
                      <span dir="ltr">{company.contactNumber}</span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(company._creationTime).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
                    {company.commercialRegistration && (
                      <span>السجل التجاري: {company.commercialRegistration}</span>
                    )}
                    {company.activities && (
                      <span>{company.activities}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify(company._id)}
                    disabled={actionId === company._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    <BadgeCheck size={16} />
                    <span>{actionId === company._id ? "..." : "توثيق"}</span>
                  </button>
                  <button
                    onClick={() => handleReject(company._id)}
                    disabled={actionId === company._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
