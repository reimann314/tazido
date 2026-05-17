/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser, getToken } from "../lib/auth";
import {
  Send, Loader2, Bot, CheckCircle, XCircle, FileText, Search, Sparkles, PanelRightClose,
  Briefcase, User, ClipboardList, BarChart3, Bookmark, Star, GraduationCap, SendHorizonal,
} from "lucide-react";

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
  const icons: Record<string, [any, string]> = {
    createOpportunity: [FileText, "text-emerald-600"],
    searchStudents: [Search, "text-blue-600"],
    getMyJobs: [Briefcase, "text-indigo-600"],
    getApplications: [ClipboardList, "text-blue-600"],
    getStudentProfile: [User, "text-purple-600"],
    getMyApplications: [ClipboardList, "text-blue-600"],
    getSuggestedJobs: [Sparkles, "text-amber-600"],
    getStats: [BarChart3, "text-green-600"],
    getShortlists: [Bookmark, "text-rose-600"],
    sendMessageToStudent: [SendHorizonal, "text-cyan-600"],
    addToShortlist: [Bookmark, "text-rose-600"],
    applyToJob: [SendHorizonal, "text-cyan-600"],
    createProgram: [GraduationCap, "text-violet-600"],
    evaluateStudent: [Star, "text-amber-600"],
  };
  const [Icon, color] = icons[name] || [Sparkles, "text-brand"];
  return <Icon size={16} className={color} />;
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pendingAction]);
  useEffect(() => { if (open && !loading) inputRef.current?.focus(); }, [open, loading]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading || !token) return;
    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);
    setPendingAction(null);
    try {
      const history = messages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const result = await agenticChat({ token, message: text.trim(), history });
      if (result.pending) setPendingAction(result.pending);
      if (result.response) setMessages((prev) => [...prev, { role: "assistant", text: result.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: err instanceof Error ? err.message : "حدث خطأ", type: "error" }]);
    }
    setLoading(false);
    if (!pendingAction) setTimeout(() => inputRef.current?.focus(), 100);
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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleReject = () => {
    setPendingAction(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const resetChat = () => {
    setMessages([{ role: "assistant", text: "مرحباً! أنا مساعد تزيد الذكي. كيف يمكنني مساعدتك؟" }]);
    setPendingAction(null);
  };

  if (!isLoggedIn) return null;

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-l from-brand to-brand-light text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-white/20">
          <Bot size={22} />
          <span className="text-sm font-bold">المساعد الذكي</span>
          <Sparkles size={14} className="text-gold/80" />
        </button>
      )}

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />}

      {/* Side panel */}
      {open && (
        <div className="fixed top-0 left-0 h-full w-full sm:w-[440px] z-50 bg-white shadow-2xl flex flex-col animate-slide-in">
          {/* Header */}
          <div className="bg-gradient-to-l from-brand to-brand-light text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Bot size={20} />
              </span>
              <div>
                <p className="font-bold text-base">المساعد الذكي</p>
                <p className="text-[11px] text-white/70">وكيل ذكي لتنفيذ المهام وإدارة المنصة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetChat} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
                جديد
              </button>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                <PanelRightClose size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-md shadow-sm"
                    : msg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 rounded-bl-md"
                    : msg.type === "error"
                    ? "bg-red-50 border border-red-200 rounded-bl-md"
                    : "bg-white border border-border-light rounded-bl-md shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap">{formatResponse(msg.text)}</p>
                </div>
              </div>
            ))}

            {pendingAction && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-4 shadow-md">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    {getIconForAction(pendingAction.name)}
                  </span>
                  <p className="text-sm font-bold text-amber-900">طلب تأكيد الإجراء</p>
                </div>
                <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{pendingAction.description}</p>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={handleConfirm} disabled={executing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 shadow-sm transition-all">
                    {executing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    <span>{executing ? "جاري التنفيذ..." : "تأكيد"}</span>
                  </button>
                  <button onClick={handleReject} disabled={executing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-red-200 bg-white text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-60 transition-all">
                    <XCircle size={16} />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            )}

            {(loading || executing) && !pendingAction && (
              <div className="flex justify-start">
                <div className="bg-white border border-border-light rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-brand" />
                  <span className="text-sm text-text-secondary">{executing ? "جاري تنفيذ الإجراء..." : "جاري التحليل..."}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !pendingAction && (
            <div className="px-5 py-3 flex flex-wrap gap-2 border-t border-border-light bg-white">
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="px-4 py-2 rounded-full bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors border border-brand/15">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border-light bg-white shrink-0">
            {!pendingAction ? (
              <div className="flex items-center gap-3">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend(input))}
                  placeholder="اكتب سؤالك أو طلبك..." disabled={loading || executing}
                  className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-border-light bg-gray-50 text-sm focus:outline-none focus:border-brand focus:bg-white transition-all disabled:opacity-50 placeholder:text-gray-400" />
                <button onClick={() => handleSend(input)}
                  disabled={!input.trim() || loading || executing}
                  className="p-3.5 rounded-2xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-all shadow-sm shrink-0">
                  <Send size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center text-sm text-text-muted py-2">
                قم بتأكيد أو إلغاء الإجراء المقترح أعلاه
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
