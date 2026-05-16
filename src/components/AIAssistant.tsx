import { useState, useRef, useEffect } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser, getToken } from "../lib/auth";
import { X, Send, Loader2, Bot, CheckCircle, XCircle } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string; actions?: Action[] };

type Action = {
  name: string;
  args: any;
  result: string;
};

type PendingAction = {
  description: string;
  name: string;
  args: any;
};

const suggestions = [
  "انشر فرصة تدريب في تطوير الويب في الرياض",
  "ابحث عن طلاب متخصصين في التسويق",
  "كيف أضيف عضو فريق؟",
];

function getActionLabel(name: string): string {
  const labels: Record<string, string> = {
    createOpportunity: "إنشاء فرصة جديدة",
    searchStudents: "البحث عن طلاب",
    sendMessageToStudent: "إرسال رسالة",
  };
  return labels[name] || name;
}

function getActionDescription(name: string, args: any): string {
  switch (name) {
    case "createOpportunity":
      return `سأقوم بإنشاء فرصة جديدة:\n- العنوان: ${args.title}\n- الموقع: ${args.location}\n- النوع: ${args.type === "internship" ? "تدريب" : args.type === "full-time" ? "دوام كامل" : "دوام جزئي"}`;
    case "searchStudents":
      return `سأبحث عن طلاب${args.specialization ? ` في تخصص: ${args.specialization}` : ""}${args.skills ? ` بمهارات: ${args.skills}` : ""}`;
    case "sendMessageToStudent":
      return `سأرسل رسالة إلى الطالب`;
    default:
      return `تنفيذ: ${name}`;
  }
}

export default function AIAssistant() {
  const token = getToken() ?? "";
  const agenticChat = useAction(api.aiAgent.agenticChat);
  const me = useCurrentUser();
  const isLoggedIn = me !== undefined && me !== null;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "مرحباً! أنا مساعد تزيد الذكي. كيف يمكنني مساعدتك؟" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingAction]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading || !token) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const result = await agenticChat({ token, message: text.trim(), history });

      if (result.actions && result.actions.length > 0) {
        const action = result.actions[0];
        if (action.name === "createOpportunity" || action.name === "sendMessageToStudent") {
          setPendingAction({
            description: getActionDescription(action.name, action.args),
            name: action.name,
            args: action.args,
          });
          return;
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", text: result.response, actions: result.actions }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "عذراً، حدث خطأ في الاتصال";
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
    }
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!pendingAction || !token) return;
    setLoading(true);
    setPendingAction(null);

    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const confirmMsg = `تأكيد: قم بتنفيذ "${pendingAction.name}" بالبيانات التالية: ${JSON.stringify(pendingAction.args)}`;
      const result = await agenticChat({ token, message: confirmMsg, history });

      setMessages((prev) => [...prev, {
        role: "assistant",
        text: result.response,
        actions: result.actions,
      }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "عذراً، حدث خطأ";
      setMessages((prev) => [...prev, { role: "assistant", text: msg }]);
    }
    setLoading(false);
  };

  const handleReject = () => {
    setPendingAction(null);
    setMessages((prev) => [...prev, { role: "assistant", text: "تم إلغاء العملية." }]);
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
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand text-white rounded-br-sm shadow-sm"
                      : "bg-white border border-border-light rounded-bl-sm shadow-sm"
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-1 mr-2">
                    {msg.actions.map((a, j) => (
                      <div key={j} className="text-[11px] text-emerald-600 font-medium">
                        ✅ {getActionLabel(a.name)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {pendingAction && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-medium text-amber-800">تأكيد العملية</p>
                <p className="text-sm text-amber-700 whitespace-pre-wrap">{pendingAction.description}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    <CheckCircle size={14} />
                    <span>تأكيد</span>
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-60 transition-colors"
                  >
                    <XCircle size={14} />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border-light rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 size={18} className="animate-spin text-brand" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && !pendingAction && (
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
            {!pendingAction && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend(input))}
                  placeholder={isLoggedIn ? "اكتب سؤالك أو طلبك..." : "سجّل دخولك لاستخدام المساعد"}
                  disabled={!isLoggedIn}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-gray-50 text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading || !isLoggedIn}
                  className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
