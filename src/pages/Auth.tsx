import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { setToken } from "../lib/auth";

type Role = "student" | "company";
type Mode = "login" | "signup";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode: Mode = location.pathname.includes("login") ? "login" : "signup";
  const initialRole: Role = (params.get("role") as Role) || "student";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>(initialRole);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = useAction(api.auth.signUp);
  const signIn = useAction(api.auth.signIn);

  useEffect(() => {
    setMode(location.pathname.includes("login") ? "login" : "signup");
  }, [location.pathname]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setSubmitting(true);
    setError(null);
    try {
      const result =
        mode === "signup"
          ? await signUp({
              role,
              email: data.email,
              password: data.password,
              name: data.fullName,
              companyName: data.companyName,
              university: data.university,
              website: data.website,
            })
          : await signIn({ email: data.email, password: data.password });
      setToken(result.token);
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "حدث خطأ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="container-main py-12 md:py-20">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-6 md:p-10">
          {/* Mode tabs */}
          <div className="flex bg-surface rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => navigate(`/signup?role=${role}`)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "signup" ? "bg-brand text-white" : "text-text-secondary"
              }`}
            >
              إنشاء حساب
            </button>
            <button
              type="button"
              onClick={() => navigate(`/login?role=${role}`)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "login" ? "bg-brand text-white" : "text-text-secondary"
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {(["student", "company"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-3 px-4 rounded-2xl border text-sm font-medium transition-all ${
                  role === r
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border-light text-text-secondary hover:border-brand/40"
                }`}
              >
                {r === "student" ? "طالب / موهبة" : "شركة"}
              </button>
            ))}
          </div>

          <h1 className="text-h2 mb-2">
            {mode === "signup"
              ? role === "student"
                ? "انضم لتزيد كطالب"
                : "سجّل شركتك في تزيد"
              : "أهلاً بعودتك"}
          </h1>
          {mode === "login" && (
            <p className="text-text-secondary mb-6 text-sm">ادخل بياناتك لمتابعة جلستك.</p>
          )}

          {done ? (
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium mb-1">
                {mode === "signup" ? "تم إنشاء الحساب" : "تم تسجيل الدخول"}
              </p>
              <p className="text-sm text-text-secondary">جاري التحويل...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm space-y-2">
                  <p>{error}</p>
                  {mode === "signup" && error.includes("مسجّل لدينا") && (
                    <Link
                      to={`/login?role=${role}`}
                      className="inline-block font-medium underline"
                    >
                      انتقل إلى تسجيل الدخول
                    </Link>
                  )}
                  {mode === "login" && error.includes("غير صحيحة") && (
                    <Link
                      to={`/signup?role=${role}`}
                      className="inline-block font-medium underline"
                    >
                      ليس لديك حساب؟ أنشئ حساباً جديداً
                    </Link>
                  )}
                </div>
              )}
              {mode === "signup" && (
                <Field
                  name={role === "company" ? "companyName" : "fullName"}
                  label={role === "company" ? "اسم الشركة" : "الاسم الكامل"}
                  required
                />
              )}
              <Field name="email" type="email" label="البريد الإلكتروني" required />
              {mode === "signup" && role === "student" && (
                <Field name="university" label="الجامعة / التخصص (اختياري)" />
              )}
              {mode === "signup" && role === "company" && (
                <Field name="website" label="الموقع الإلكتروني (اختياري)" placeholder="example.com" />
              )}
              <Field name="password" type="password" label="كلمة المرور" required />

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting
                  ? "جاري الإرسال..."
                  : mode === "signup"
                  ? "إنشاء الحساب"
                  : "تسجيل الدخول"}
              </button>

              <p className="text-xs text-center text-text-secondary pt-2">
                {mode === "signup" ? (
                  <>
                    لديك حساب؟{" "}
                    <Link to={`/login?role=${role}`} className="text-brand font-medium">
                      دخول
                    </Link>
                  </>
                ) : (
                  <>
                    جديد على تزيد؟{" "}
                    <Link to={`/signup?role=${role}`} className="text-brand font-medium">
                      إنشاء حساب
                    </Link>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-text-primary">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
      />
    </label>
  );
}
