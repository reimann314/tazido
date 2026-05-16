import { useState } from "react";
import { Sparkles, X } from "lucide-react";

const BANNER_KEY = "tazid_ai_banner_dismissed";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(BANNER_KEY) === "true"; } catch (e) { console.debug("localStorage unavailable", e); return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(BANNER_KEY, "true"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-l from-brand via-brand to-brand-light text-white text-center py-1.5 px-4 relative flex items-center justify-center">
      <p className="text-xs font-medium flex items-center gap-1.5">
        <Sparkles size={12} className="text-gold" />
        جرّب مساعدنا الذكي الجديد — أفضل تجربة للبحث عن المواهب
        <Sparkles size={12} className="text-gold" />
      </p>
      <button
        onClick={handleDismiss}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/20 rounded transition-colors"
        aria-label="إغلاق"
      >
        <X size={12} />
      </button>
    </div>
  );
}
