import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

const suggestions = [
  "كيف أنشر فرصة تدريب؟",
  "كيف أضيف عضو فريق؟",
  "كيف أحدد موعد مقابلة؟",
  "كيف أقيّم متدرب؟",
];

export default function AIAssistant() {
  const ask = useAction(api.ai.askAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "مرحباً! أنا مساعد تزيد الذكي. كيف يمكنني مساعدتك؟" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await ask({ question: text.trim() });
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "عذراً، حدث خطأ في الاتصال";
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark transition-all flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 left-6 z-40 w-80 sm:w-96 bg-white rounded-2xl border border-border-light shadow-float overflow-hidden flex flex-col" style={{ maxHeight: "500px" }}>
          {/* Header */}
          <div className="bg-brand text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <span className="font-semibold text-sm">مساعد تزيد الذكي</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px] max-h-[350px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-lg"
                    : "bg-surface text-text-primary rounded-bl-lg"
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-surface rounded-2xl px-4 py-3">
                  <Loader2 size={18} className="animate-spin text-brand" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border-light bg-surface">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="اسأل عن المنصة..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:border-brand"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
