import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getToken } from "../lib/auth";
import { Bell } from "lucide-react";

function getNotificationTarget(type: string): string {
  const map: Record<string, string> = {
    new_message: "/dashboard?tab=messages",
    interview_scheduled: "/dashboard?tab=interviews",
    interview_confirmed: "/dashboard?tab=interviews",
    interview_cancelled: "/dashboard?tab=interviews",
    interview_reschedule: "/dashboard?tab=interviews",
    interview_meeting: "/dashboard?tab=interviews",
    offer_received: "/dashboard?tab=offers",
    offer_response: "/dashboard?tab=offers",
    application_status: "/dashboard?tab=applications",
    application_withdrawn: "/dashboard?tab=applications",
    new_application: "/dashboard?tab=candidates",
  };
  return map[type] || "/dashboard";
}

export default function NotificationsBell() {
  const navigate = useNavigate();
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
              <div className="p-6 text-center text-sm text-text-secondary">
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-text-secondary">لا توجد إشعارات</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => {
                    setOpen(false);
                    if (!n.read && token) markRead({ token, notificationId: n._id });
                    navigate(getNotificationTarget(n.type));
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
