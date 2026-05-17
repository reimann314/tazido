import { useState } from "react";
import { Bot, X } from "lucide-react";

const BANNER_KEY = "tazid_ai_banner_dismissed";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(BANNER_KEY) === "true"; } catch (err) { console.debug(err); return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(BANNER_KEY, "true"); } catch (err) { console.debug(err); }
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-l from-brand-dark via-brand to-brand-light text-white text-center py-2 px-4 relative flex items-center justify-center">
      <p className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
        <Bot size={14} className="shrink-0" />
        جرّب مساعدنا الذكي — نفّذ مهامك وأتممت إجراءاتك عبر محادثة مباشرة مع وكيل ذكي
      </p>
      <button
        onClick={handleDismiss}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/20 rounded transition-colors"
        aria-label="إغلاق"
      >
        <X size={13} />
      </button>
    </div>
  );
}
