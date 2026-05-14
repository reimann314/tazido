import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const userId = params.get("userId") as any;
  const verifyEmail = useAction(api.auth.verifyEmail);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !userId) {
      setStatus("error");
      setMessage("رابط التأكيد غير صالح.");
      return;
    }
    verifyEmail({ token, userId })
      .then(() => {
        setStatus("success");
        setMessage("تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "حدث خطأ أثناء تأكيد البريد.");
      });
  }, [token, userId, verifyEmail]);

  return (
    <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-border-light shadow-sm p-8 md:p-10 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand/10 flex items-center justify-center">
              <svg className="animate-spin w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-text-secondary">جاري تأكيد البريد الإلكتروني...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">تم التأكيد بنجاح</h1>
            <p className="text-text-secondary mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-all"
            >
              تسجيل الدخول
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">فشل التأكيد</h1>
            <p className="text-text-secondary mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-all"
            >
              العودة إلى تسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
