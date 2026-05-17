import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser, getToken, logout } from "../../lib/auth";
import { Lock, Shield, User, CheckCircle, Download, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const me = useCurrentUser();
  const token = getToken() ?? "";
  const requestPasswordReset = useAction(api.auth.requestPasswordReset);
  const updateStudent = useMutation(api.users.updateStudentProfile);
  const updateCompany = useMutation(api.users.updateCompanyProfile);
  const exportData = useQuery(api.account.exportData, token ? { token } : "skip");
  const deleteAccount = useMutation(api.account.deleteAccount);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [nameSubmitting, setNameSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (me) setNameValue(me.name ?? me.companyName ?? "");
  }, [me]);

  if (!me) return null;

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try { await requestPasswordReset({ email: me.email }); setSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ"); }
    finally { setSubmitting(false); }
  };

  const handleNameSave = async () => {
    if (!token || !nameValue.trim()) return;
    setNameSubmitting(true); setError("");
    try {
      if (me.role === "student") await updateStudent({ token, name: nameValue.trim() });
      else await updateCompany({ token, companyName: nameValue.trim() });
      setNameSaved(true); setEditName(false);
      setTimeout(() => setNameSaved(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ"); }
    finally { setNameSubmitting(false); }
  };

  const handleExport = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tazid-data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!token || !deletePassword) return;
    setDeleting(true); setError("");
    try {
      await deleteAccount({ token });
      await logout();
      window.location.href = "/";
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <h1 className="text-h2 mb-2">الإعدادات</h1>
      <p className="text-text-secondary mb-8">إدارة إعدادات حسابك.</p>
      <div className="grid gap-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand"><User size={20} /></span>
            <h3 className="font-bold text-text-primary">معلومات الحساب</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">{me.role === "student" ? "الاسم" : "اسم الشركة"}</span>
              {editName ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={nameValue} onChange={(e) => setNameValue(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-border-light bg-surface text-sm text-left" autoFocus />
                  <button onClick={handleNameSave} disabled={nameSubmitting}
                    className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand-dark disabled:opacity-60">حفظ</button>
                  <button onClick={() => { setEditName(false); setNameValue(me.name ?? me.companyName ?? ""); }}
                    className="px-3 py-1.5 rounded-lg border border-border-light text-text-secondary text-xs">إلغاء</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">{nameValue}</span>
                  <button onClick={() => setEditName(true)} className="text-brand text-xs hover:underline">تعديل</button>
                </div>
              )}
            </div>
            {nameSaved && <div className="flex items-center gap-2 text-green-600 text-xs"><CheckCircle size={14} /><span>تم الحفظ</span></div>}
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">البريد الإلكتروني</span>
              <span className="text-text-primary font-medium" dir="ltr">{me.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">النوع</span>
              <span className="text-text-primary font-medium">{me.role === "student" ? "طالب" : "شركة"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-secondary">حالة البريد</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${me.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {me.emailVerified ? "مؤكد" : "غير مؤكد"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand"><Lock size={20} /></span>
            <h3 className="font-bold text-text-primary">تغيير كلمة المرور</h3>
          </div>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" /><span>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</span>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <p className="text-sm text-text-secondary">سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</p>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
                {submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand"><Download size={20} /></span>
            <h3 className="font-bold text-text-primary">تصدير البيانات</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">قم بتصدير جميع بياناتك الشخصية وسجل نشاطك على المنصة.</p>
          <button onClick={handleExport} disabled={!exportData}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all">
            <Download size={16} /><span>تصدير البيانات (JSON)</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><Trash2 size={20} /></span>
            <h3 className="font-bold text-text-primary text-red-700">حذف الحساب</h3>
          </div>
          <p className="text-sm text-text-secondary mb-4">حذف حسابك نهائياً مع جميع بياناتك. لا يمكن التراجع عن هذا الإجراء.</p>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">
              <Trash2 size={16} /><span>حذف الحساب</span>
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                <AlertTriangle size={16} /><span>تأكيد حذف الحساب</span>
              </div>
              <p className="text-sm text-red-600">هذا الإجراء نهائي ولا يمكن التراجع عنه. جميع بياناتك ستحذف نهائياً.</p>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="أدخل كلمة المرور للتأكيد" className="w-full px-4 py-2.5 rounded-xl border border-red-200 bg-white text-sm focus:outline-none focus:border-red-500" />
              {error && <div className="text-red-700 text-sm">{error}</div>}
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleting || !deletePassword}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                  {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
                </button>
                <button onClick={() => setShowDelete(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-text-secondary text-sm font-medium hover:bg-surface">
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">نوصي بتغيير كلمة المرور بشكل دوري وعدم مشاركتها مع أي شخص. جميع بياناتك مشفرة ومحمية وفق أعلى معايير الأمان.</p>
        </div>
      </div>
    </div>
  );
}
