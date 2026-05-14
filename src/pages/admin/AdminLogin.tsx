import { useState, type ReactNode, Component } from "react";
import { useNavigate } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { setAdminToken } from "../../lib/admin-auth";

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8" dir="rtl">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold mb-4">خطأ في تحميل الصفحة</h1>
            <p className="text-gray-400 text-sm mb-4">{this.state.error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand rounded-lg text-sm">
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoginForm() {
  const navigate = useNavigate();
  const login = useAction(api.admin.adminLogin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await login({ username, password });
      setAdminToken(result.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">لوحة التحكم</h1>
          <p className="text-gray-400 text-sm">الدخول إلى نظام الإدارة</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white rounded-2xl p-8 shadow-2xl space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-gray-700">اسم المستخدم</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-brand focus:bg-white text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium mb-1.5 text-gray-700">كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-brand focus:bg-white text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-60 text-sm"
          >
            {submitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  );
}
