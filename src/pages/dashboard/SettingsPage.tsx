import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "../../lib/auth";
import { Lock, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const me = useCurrentUser();
  const requestPasswordReset = useAction(api.auth.requestPasswordReset);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!me) return null;

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset({ email: me.email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-h2 mb-2">الإعدادات</h1>
      <p className="text-text-secondary mb-8">إدارة إعدادات حسابك.</p>

      <div className="grid gap-6 max-w-2xl">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand">
              <User size={20} />
            </span>
            <h3 className="font-bold text-text-primary">معلومات الحساب</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
              <span className="text-text-secondary">البريد الإلكتروني</span>
              <span className="text-text-primary font-medium" dir="ltr">{me.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
              <span className="text-text-secondary">النوع</span>
              <span className="text-text-primary font-medium">{me.role === "student" ? "طالب" : "شركة"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
              <span className="text-text-secondary">حالة البريد</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                me.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
              }`}>
                {me.emailVerified ? "مؤكد" : "غير مؤكد"}
              </span>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-border-light p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand">
              <Lock size={20} />
            </span>
            <h3 className="font-bold text-text-primary">تغيير كلمة المرور</h3>
          </div>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <p className="text-sm text-text-secondary">
                سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              </p>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
                {submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
          )}
        </div>

        {/* Security Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            نوصي بتغيير كلمة المرور بشكل دوري وعدم مشاركتها مع أي شخص. جميع بياناتك مشفرة ومحمية وفق أعلى معايير الأمان.
          </p>
        </div>
      </div>
    </div>
  );
}
