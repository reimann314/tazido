import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { login as authLogin, signup as authSignup } from "../lib/auth";

type Role = "student" | "company";
type Mode = "login" | "signup" | "forgot";
type AcademicLevel = "" | "university" | "high-school";
type EntityType = "" | "university" | "high-school" | "association" | "other";

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

  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>("");
  const [entityType, setEntityType] = useState<EntityType>("");

  useEffect(() => {
    setMode(location.pathname.includes("login") ? "login" : "signup");
  }, [location.pathname]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "signup") {
        await authSignup({
          role,
          email: data.email,
          password: data.password,
          name: data.fullName,
          companyName: data.companyName,
          university: data.university,
          website: data.website,
          nationalId: data.nationalId,
          mobileNumber: data.mobileNumber,
          academicLevel: data.academicLevel,
          specialization: data.specialization,
          skills: data.skills,
          languages: data.languages,
          hobbies: data.hobbies,
          experiences: data.experiences,
          entityType: data.entityType,
          entityName: data.entityName,
          contactNumber: data.contactNumber,
          commercialRegistration: data.commercialRegistration,
          activities: data.activities,
          crValidityDate: data.crValidityDate,
          companyAge: data.companyAge,
        });
      } else {
        await authLogin(data.email, data.password);
      }
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <div className="container-main py-12 md:py-20">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-6 md:p-10">
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

          {mode === "signup" && (
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
          )}

          <h1 className="text-h2 mb-2">
            {mode === "forgot"
              ? "استعادة كلمة المرور"
              : mode === "signup"
              ? role === "student"
                ? "صفحة تسجيل الطلاب"
                : "سجّل شركتك في تزيد"
              : "أهلاً بعودتك"}
          </h1>
          {mode === "login" && (
            <p className="text-text-secondary mb-6 text-sm">ادخل بياناتك لمتابعة جلستك.</p>
          )}

          {mode === "forgot" ? (
            <ForgotPasswordForm onBack={() => { setMode("login"); setError(null); }} />
          ) : done ? (
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="font-medium mb-1">
                {mode === "signup" ? "تم إنشاء الحساب" : "تم تسجيل الدخول"}
              </p>
              <p className="text-sm text-text-secondary">جاري التحويل...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
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

              {/* ===== LOGIN FIELDS ===== */}
              {mode === "login" && (
                <div className="space-y-4">
                  <Field name="email" type="email" label="البريد الإلكتروني" required />
                  <Field name="password" type="password" label="كلمة المرور" required />
                  <div className="text-left">
                    <Link
                      to="/login"
                      onClick={() => setMode("forgot")}
                      className="text-sm text-brand hover:text-brand-dark font-medium transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </div>
              )}

              {/* ===== STUDENT SIGNUP FIELDS ===== */}
              {mode === "signup" && role === "student" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px]">1</span>
                      المعلومات الأساسية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field name="fullName" label="اسم الطالب" required />
                      <Field name="nationalId" label="السجل المدني" />
                      <Field name="email" type="email" label="الايميل" required />
                      <Field name="mobileNumber" type="tel" label="رقم الجوال" placeholder="05xxxxxxxx" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px]">2</span>
                      المستوى الأكاديمي
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectField
                        name="academicLevel"
                        label="السنة الدراسية"
                        value={academicLevel}
                        onChange={setAcademicLevel}
                        options={[
                          { value: "", label: "اختر السنة الدراسية" },
                          { value: "university", label: "جامعي" },
                          { value: "high-school", label: "ثانوي" },
                        ]}
                      />
                      <Field name="specialization" label="التخصص" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px]">3</span>
                      المهارات والاهتمامات
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextAreaField name="skills" label="المهارات" />
                      <TextAreaField name="languages" label="اللغات" />
                      <TextAreaField name="hobbies" label="الهوايات" />
                      <TextAreaField name="experiences" label="الخبرات" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center text-brand text-[10px]">4</span>
                      الجهة
                    </h3>
                    <div className="space-y-4">
                      <SelectField
                        name="entityType"
                        label="نوع الجهة"
                        value={entityType}
                        onChange={setEntityType}
                        options={[
                          { value: "", label: "اختر نوع الجهة" },
                          { value: "university", label: "جامعة" },
                          { value: "high-school", label: "ثانوية" },
                          { value: "association", label: "جمعية (مثال: أيتام)" },
                          { value: "other", label: "أخرى (دعم استثناءات)" },
                        ]}
                      />
                      <Field
                        name="entityName"
                        label={
                          entityType === "university" ? "اسم الجامعة" :
                          entityType === "high-school" ? "اسم الثانوية" :
                          entityType === "association" ? "اسم الجمعية" :
                          entityType === "other" ? "تفاصيل أخرى" :
                          "اسم الجهة"
                        }
                        placeholder={
                          entityType === "association" ? "مثال: جمعية أيتام..." :
                          entityType === "other" ? "يرجى التوضيح..." : ""
                        }
                      />
                    </div>
                  </div>

                  <Field name="password" type="password" label="كلمة المرور" required />
                </div>
              )}

              {/* ===== COMPANY SIGNUP FIELDS ===== */}
              {mode === "signup" && role === "company" && (
                <div className="space-y-4">
                  <Field name="companyName" label="اسم الشركة" required />
                  <Field name="email" type="email" label="البريد الإلكتروني" required />
                  <Field name="contactNumber" type="tel" label="رقم التواصل" placeholder="05xxxxxxxx" />
                  <Field name="commercialRegistration" label="رقم السجل التجاري" />
                  <TextAreaField name="activities" label="أعمال ومهام الشركة" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="crValidityDate" type="text" label="تاريخ سريان السجل التجاري" placeholder="هجري / ميلادي" />
                    <Field name="companyAge" type="text" label="عمر الشركة أو المؤسسة" placeholder="بالسنوات" />
                  </div>
                  <Field name="website" label="الموقع الإلكتروني" placeholder="example.com" />
                  <Field name="password" type="password" label="كلمة المرور" required />
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting
                  ? "جاري الإرسال..."
                  : mode === "signup"
                  ? role === "student" ? "تسجيل" : "إنشاء الحساب"
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

function Field({ name, label, type = "text", required, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-text-primary">{label}{required && <span className="text-red-500 mr-0.5">*</span>}</span>
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

function TextAreaField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-text-primary">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors resize-none"
      />
    </label>
  );
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestPasswordReset = useAction(api.auth.requestPasswordReset);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-3">تم إرسال رابط إعادة التعيين</h2>
        <p className="text-text-secondary text-sm mb-6">
          إذا كان البريد الإلكتروني مسجلاً لدينا، ستتلقى رابطاً لإعادة تعيين كلمة المرور.
        </p>
        <button onClick={onBack} className="text-brand font-medium hover:text-brand-dark transition-colors">
          العودة إلى تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <p className="text-text-secondary text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</p>
      <label className="block">
        <span className="block text-sm font-medium mb-1.5 text-text-primary">البريد الإلكتروني</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
        />
      </label>
      <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
        {submitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
      </button>
      <button type="button" onClick={onBack} className="block w-full text-center text-sm text-text-secondary hover:text-brand transition-colors py-2">
        العودة إلى تسجيل الدخول
      </button>
    </form>
  );
}

function SelectField({ name, label, value, onChange, options }: { name: string; label: string; value: string; onChange: (v: any) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5 text-text-primary">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand focus:bg-white transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
