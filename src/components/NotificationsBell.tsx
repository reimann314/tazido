import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getToken } from "../lib/auth";
import { Bell } from "lucide-react";

export default function NotificationsBell() {
  const token = getToken() ?? undefined;
  const notifications = useQuery(api.notifications.list, token ? { token } : "skip");
  const unreadCount = useQuery(api.notifications.unreadCount, token ? { token } : "skip");
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-surface transition-colors"
      >
        <Bell size={20} className="text-text-secondary" />
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-border-light shadow-float z-50 overflow-hidden">
          <div className="p-3 border-b border-border-light flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">الإشعارات</span>
            {unreadCount && unreadCount > 0 && (
              <button
                onClick={() => token && markAllRead({ token })}
                className="text-xs text-brand font-medium hover:underline"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!notifications ? (
              <div className="p-6 text-center text-sm text-text-secondary">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-secondary">لا توجد إشعارات</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => {
                    if (!n.read && token) markRead({ token, notificationId: n._id });
                  }}
                  className={`w-full text-right px-4 py-3 border-b border-border-light last:border-0 hover:bg-surface transition-colors ${
                    n.read ? "" : "bg-brand/[0.03]"
                  }`}
                >
                  <p className={`text-sm ${n.read ? "text-text-secondary" : "text-text-primary font-medium"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
