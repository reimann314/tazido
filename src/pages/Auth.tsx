import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

type Role = "student" | "company";
type Mode = "login" | "signup";

// TODO(convex): Replace these mock handlers with Convex mutations.
// Example:
//   const signUp = useMutation(api.auth.signUp);
//   await signUp({ role, email, password, ...profile });
async function mockSubmit(payload: Record<string, unknown>) {
  await new Promise((r) => setTimeout(r, 600));
  console.log("[mock auth submit]", payload);
  return { ok: true };
}

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

  useEffect(() => {
    setMode(location.pathname.includes("login") ? "login" : "signup");
  }, [location.pathname]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setSubmitting(true);
    await mockSubmit({ mode, role, ...data });
    setSubmitting(false);
    setDone(true);
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
              <p className="font-medium mb-1">تم الاستلام (نسخة تجريبية)</p>
              <p className="text-sm text-text-secondary mb-4">
                البيانات ما تنحفظ بعد — انتظر تفعيل Convex.
              </p>
              <button onClick={() => setDone(false)} className="btn-primary">
                نموذج جديد
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <Field
                  name={role === "company" ? "companyName" : "fullName"}
                  label={role === "company" ? "اسم الشركة" : "الاسم الكامل"}
                  required
                />
              )}
              <Field name="email" type="email" label="البريد الإلكتروني" required />
              {mode === "signup" && role === "student" && (
                <Field name="university" label="الجامعة / التخصص" />
              )}
              {mode === "signup" && role === "company" && (
                <Field name="website" label="الموقع الإلكتروني" type="url" />
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
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-text-primary">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
      />
    </label>
  );
}
