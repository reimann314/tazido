import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const userId = params.get("userId") as any;
  const resetPassword = useAction(api.auth.resetPassword);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!token || !userId) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">رابط غير صالح</h1>
          <p className="text-text-secondary mb-6">رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-all">
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("كلمة المرور قصيرة، يجب أن تحتوي على ٦ أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمة المرور وتأكيدها غير متطابقين");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token, userId, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">تم إعادة تعيين كلمة المرور</h1>
          <p className="text-text-secondary mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-all">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-8 md:p-10">
        <h1 className="text-2xl font-bold text-text-primary mb-2 text-center">إعادة تعيين كلمة المرور</h1>
        <p className="text-text-secondary text-sm mb-6 text-center">أدخل كلمة المرور الجديدة لحسابك.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-text-primary">كلمة المرور الجديدة</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-text-primary">تأكيد كلمة المرور</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
          </button>
        </form>
      </div>
    </div>
  );
}
