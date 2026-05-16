import { useState } from "react";
import { Sparkles, X } from "lucide-react";

const BANNER_KEY = "tazid_ai_banner_dismissed";

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(BANNER_KEY) === "true"; } catch { console.debug("localStorage unavailable"); return false; }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(BANNER_KEY, "true"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="bg-gradient-to-l from-brand via-brand to-brand-light text-white text-center py-2.5 px-4 relative">
      <p className="text-sm font-medium flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-gold" />
        جرّب مساعدنا الذكي الجديد — أفضل تجربة للبحث عن المواهب
        <Sparkles size={16} className="text-gold" />
      </p>
      <button
        onClick={handleDismiss}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="إغلاق"
      >
        <X size={16} />
      </button>
    </div>
  );
}
