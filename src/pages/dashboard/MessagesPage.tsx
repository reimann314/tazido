import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { MessageCircle, Send, User, Building2, ArrowLeft } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

export default function MessagesPage() {
  const token = getToken() ?? "";
  const conversations = useQuery(api.conversations.list, token ? { token } : "skip");
  const [selectedId, setSelectedId] = useState<Id<"conversations"> | null>(null);

  if (!conversations) return <TableSkeleton rows={4} />;

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-[calc(100vh-200px)] min-h-[500px]">
      {/* Conversation list */}
      <div className={`lg:w-80 shrink-0 bg-white rounded-2xl border border-border-light overflow-hidden ${selectedId ? "hidden lg:flex flex-col" : "flex flex-col"}`}>
        <div className="p-4 border-b border-border-light">
          <h2 className="font-bold text-text-primary">الرسائل</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-secondary">
              <MessageCircle size={32} className="mx-auto mb-3 text-text-muted" />
              لا توجد رسائل بعد
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedId(c._id)}
                className={`w-full text-right p-4 border-b border-border-light hover:bg-surface transition-colors ${
                  selectedId === c._id ? "bg-surface" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    {c.otherRole === "company" ? <Building2 size={18} /> : <User size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{c.otherName || "مستخدم"}</p>
                    {c.lastMessageBody && (
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {c.lastMessageSender === c.otherId ? "" : "أنت: "}{c.lastMessageBody}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message view */}
      <div className={`flex-1 bg-white rounded-2xl border border-border-light overflow-hidden flex flex-col ${!selectedId ? "hidden lg:flex" : "flex"}`}>
        {selectedId ? (
          <ChatView conversationId={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm p-6">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3 text-text-muted" />
              <p>اختر محادثة لعرض الرسائل</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({ conversationId, onBack }: { conversationId: Id<"conversations">; onBack: () => void }) {
  const token = getToken() ?? "";
  const me = useCurrentUser();
  const messages = useQuery(api.messages.list, token ? { token, conversationId } : "skip");
  const sendMessage = useMutation(api.messages.send);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!body.trim() || !token) return;
    setSending(true);
    try {
      await sendMessage({ token, conversationId, body: body.trim() });
      setBody("");
    } catch { console.debug("send error"); }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="p-3 border-b border-border-light flex items-center gap-3 bg-surface">
        <button onClick={onBack} className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <MessageCircle size={18} className="text-brand" />
        <span className="text-sm font-semibold text-text-primary">الرسائل</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!messages ? (
          <div className="text-center text-text-secondary text-sm py-8">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-8">لا توجد رسائل بعد. ابدأ المحادثة.</div>
        ) : (
          [...messages].reverse().map((msg) => {
            const isMe = me?._id === msg.senderId;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "bg-brand text-white rounded-br-lg"
                    : "bg-surface text-text-primary rounded-bl-lg"
                }`}>
                  <p className="leading-relaxed">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-text-muted"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border-light bg-surface">
        <div className="flex items-center gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border-light bg-white text-sm focus:outline-none focus:border-brand resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
