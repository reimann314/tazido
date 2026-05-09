import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("tazid-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("tazid-cookie-consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("tazid-cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[400px] z-50 bg-surface-pure rounded-2xl shadow-float p-6 border border-border-light">
      <p className="text-text-primary text-sm leading-relaxed mb-4">
        تستخدم تزيد{" "}
        <span className="font-semibold">ملفات تعريف الارتباط</span> لتخصيص
        تجربتك وضمان عمل موقعنا بسلاسة وقياس الأداء.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 px-4 py-2.5 bg-brand text-white rounded-full text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          قبول الكل
        </button>
        <button
          onClick={handleReject}
          className="flex-1 px-4 py-2.5 border border-text-primary text-text-primary rounded-full text-sm font-medium hover:bg-text-primary/5 transition-colors"
        >
          رفض ملفات تعريف الارتباط الاختيارية
        </button>
      </div>
    </div>
  );
}
