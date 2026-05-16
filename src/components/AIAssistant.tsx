/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser, getToken } from "../lib/auth";
import { X, Send, Loader2, Bot, CheckCircle, XCircle, FileText, Search, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string; type?: "text" | "success" | "error" };

const suggestions = [
  "انشر فرصة تدريب في تطوير الويب في الرياض",
  "ابحث عن طلاب متخصصين في التسويق",
  "ابحث عن طلاب في التصميم الجرافيكي",
];

function formatResponse(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^ {2}\d+\.\s*/gm, "• ")
    .replace(/✅/g, "✅ ");
}

function getIconForAction(name: string) {
  switch (name) {
    case "createOpportunity": return <FileText size={14} className="text-emerald-600" />;
    case "searchStudents": return <Search size={14} className="text-blue-600" />;
    default: return <Sparkles size={14} className="text-brand" />;
  }
}

export default function AIAssistant() {
  const token = getToken() ?? "";
  const agenticChat = useAction(api.aiAgent.agenticChat);
  const executeTool = useAction(api.aiAgent.executeTool);
  const me = useCurrentUser();
  const isLoggedIn = me !== undefined && me !== null;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "مرحباً! أنا مساعد تزيد الذكي. كيف يمكنني مساعدتك؟" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pendingAction]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading || !token) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    setPendingAction(null);
    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const result = await agenticChat({ token, message: text.trim(), history });
      if (result.pending) {
        setPendingAction(result.pending);
      }
      if (result.response) {
        setMessages((prev) => [...prev, { role: "assistant", text: result.response }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error ? err.message : "حدث خطأ", type: "error" }]);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!pendingAction || !token) return;
    setExecuting(true);
    setPendingAction(null);
    try {
      const result = await executeTool({ token, toolName: pendingAction.name, args: pendingAction.args });
      setMessages((prev) => [...prev, { role: "assistant", text: result.result, type: "success" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error ? err.message : "حدث خطأ", type: "error" }]);
    }
    setExecuting(false);
  };

  const handleReject = () => {
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: "assistant", text: "تم إلغاء العملية.", type: "text" }]);
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-brand to-brand-light text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-white/20">
          <Bot size={20} />
          <span className="text-sm font-bold">AI Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 left-6 z-40 w-[380px] bg-white rounded-2xl border border-border-light shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "600px" }}>
          <div className="bg-gradient-to-l from-brand to-brand-light text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center"><Bot size={18} /></span>
              <div>
                <p className="font-bold text-sm">AI Assistant</p>
                <p className="text-[10px] text-white/70">مساعد تزيد الذكي</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-xl"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-sm shadow-sm"
                    : msg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 rounded-bl-sm"
                    : msg.type === "error"
                    ? "bg-red-50 border border-red-200 rounded-bl-sm"
                    : "bg-white border border-border-light rounded-bl-sm shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{formatResponse(msg.text)}</p>
                </div>
              </div>
            ))}

            {pendingAction && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  {getIconForAction(pendingAction.name)}
                  <p className="text-sm font-bold text-amber-900">طلب تأكيد</p>
                </div>
                <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{pendingAction.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={handleConfirm} disabled={executing}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 shadow-sm transition-all">
                    {executing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    <span>{executing ? "جاري التنفيذ..." : "تأكيد"}</span>
                  </button>
                  <button onClick={handleReject} disabled={executing}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl border-2 border-red-200 bg-white text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-all">
                    <XCircle size={16} />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            )}

            {(loading || executing) && !pendingAction && (
              <div className="flex justify-start">
                <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-brand" />
                  <span className="text-sm text-text-secondary">{executing ? "جاري التنفيذ..." : "جاري التفكير..."}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && !pendingAction && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-border-light/50 pt-3">
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full bg-brand/5 text-brand text-[11px] font-medium hover:bg-brand/10 transition-colors border border-brand/10">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border-light bg-white">
            {!pendingAction ? (
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend(input))}
                  placeholder="اكتب سؤالك أو طلبك..." disabled={loading || executing}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-gray-50 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors disabled:opacity-50" />
                <button onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading || executing}
                  className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-sm">
                  <Send size={18} />
                </button>
              </div>
            ) : (
              <div className="text-center text-xs text-text-muted py-1">قم بالتأكيد أو الإلغاء أعلاه</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
