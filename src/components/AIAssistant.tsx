import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "../lib/auth";
import { X, Send, Loader2, LogIn, Bot } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

const suggestions = [
  "كيف أنشر فرصة تدريب؟",
  "كيف أضيف عضو فريق؟",
  "كيف أحدد موعد مقابلة؟",
  "كيف أقيّم متدرب؟",
];

export default function AIAssistant() {
  const ask = useAction(api.ai.askAssistant);
  const me = useCurrentUser();
  const isLoggedIn = me !== undefined && me !== null;
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

  if (!isLoggedIn) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-brand to-brand-light text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20"
        >
          <Bot size={20} />
          <span className="text-sm font-bold tracking-wide">AI Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-40 w-[360px] bg-white rounded-2xl border border-border-light shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "560px" }}>
          <div className="bg-gradient-to-l from-brand to-brand-light text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Bot size={18} />
              </span>
              <div>
                <p className="font-bold text-sm">AI Assistant</p>
                <p className="text-[10px] text-white/70">مساعد تزيد الذكي</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.length > 0 && messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-sm shadow-sm"
                    : "bg-white border border-border-light rounded-bl-sm shadow-sm"
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 size={18} className="animate-spin text-brand" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-1.5 border-t border-border-light/50">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full bg-brand/5 text-brand text-[11px] font-medium hover:bg-brand/10 transition-colors border border-brand/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border-light bg-white">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend(input))}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-gray-50 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all"
              >
                <LogIn size={16} />
                <span>سجّل دخولك لاستخدام المساعد الذكي</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
