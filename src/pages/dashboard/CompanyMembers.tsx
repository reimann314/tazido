import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import { Users, UserPlus, X, User } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

const roleLabels: Record<string, string> = {
  admin: "مدير",
  hr: "مسؤول موارد بشرية",
  hiring_manager: "مدير توظيف",
};

export default function CompanyMembers() {
  const token = getToken() ?? "";
  const members = useQuery(api.companyMembers.list, token ? { token } : "skip");
  const addMember = useMutation(api.companyMembers.add);
  const removeMember = useMutation(api.companyMembers.remove);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "hr" | "hiring_manager">("hr");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!members) return <TableSkeleton rows={3} />;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await addMember({ token, email, role });
      setShowForm(false);
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-h2">فريق العمل</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          <UserPlus size={16} />
          <span>{showForm ? "إلغاء" : "إضافة عضو"}</span>
        </button>
      </div>
      <p className="text-text-secondary mb-8">إدارة أعضاء فريقك وصلاحياتهم.</p>

      {done && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-sm">
          تمت إضافة العضو بنجاح
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-border-light p-6 mb-8 space-y-4">
          <h3 className="font-bold text-text-primary">إضافة عضو جديد</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          <p className="text-sm text-text-secondary">
            أدخل البريد الإلكتروني لحساب الشركة الذي تريد إضافته. يجب أن يكون لديه حساب مسجل مسبقاً في تزيد.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-text-primary">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-text-primary">الصلاحية</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "hr" | "hiring_manager")}
                className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand"
              >
                <option value="hr">مسؤول موارد بشرية</option>
                <option value="hiring_manager">مدير توظيف</option>
                <option value="admin">مدير</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all">
              {submitting ? "جاري الإضافة..." : "إضافة"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-surface transition-all">
              إلغاء
            </button>
          </div>
        </form>
      )}

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا يوجد أعضاء بعد</p>
          <p className="text-sm text-text-muted">أضف أعضاء فريقك للعمل معاً على المنصة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-text-secondary">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 font-medium">البريد</th>
                <th className="text-right px-4 py-3 font-medium">الصلاحية</th>
                <th className="text-right px-4 py-3 font-medium">تاريخ الإضافة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id} className="border-t border-border-light">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                      <User size={16} />
                    </span>
                    <span className="font-medium text-text-primary">{m.name}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand/5 text-brand text-xs font-medium">
                      {roleLabels[m.role] || m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    {new Date(m.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={async () => {
                      try { await removeMember({ token, userId: m.userId }); } catch { console.debug("remove error"); }
                    }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="إزالة"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
