import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Loader2, X } from "lucide-react";

export default function DescriptionHelper({ onSelect }: { onSelect: (text: string) => void }) {
  const generate = useAction(api.ai.generateDescription);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    setResult("");
    try {
      const text = await generate({ title: title.trim(), details: details.trim() || undefined });
      setResult(text);
    } catch (err) {
      setError(err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "حدث خطأ");
    }
    setLoading(false);
  };

  const handleUse = () => {
    onSelect(result);
    setOpen(false);
    setTitle("");
    setDetails("");
    setResult("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-brand font-medium hover:text-brand-dark transition-colors"
      >
        <Sparkles size={16} />
        <span>مساعدة AI في الكتابة</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand" />
          <h4 className="font-bold text-text-primary text-sm">المساعد الذكي للكتابة</h4>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-black/5 rounded-lg">
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-text-primary">عنوان الفرصة *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تدريب في تطوير الويب"
            className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-text-primary">تفاصيل إضافية (اختياري)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="المهارات المطلوبة، مدة التدريب، أي متطلبات..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:border-brand resize-none"
          />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !title.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          <span>{loading ? "جاري الكتابة..." : "إنشاء وصف"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-blue-200 p-4 text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {result}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUse}
              className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all"
            >
              استخدام هذا النص
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-blue-200 text-text-secondary text-sm font-medium hover:bg-white transition-all"
            >
              إعادة الإنشاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
