import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }) + " " + new Date(ts).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}

function SlotPicker({ slots, selected, onSelect }: { slots: number[]; selected: number | null; onSelect: (ts: number) => void }) {
  return (
    <div className="space-y-2">
      {slots.map((slot, i) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          disabled={selected !== null}
          className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
            selected === slot
              ? "bg-brand text-white border-brand"
              : selected
                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-text-primary border-border-light hover:border-brand/40"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>الموعد {i + 1}: {formatDate(slot)}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function InterviewsPage() {
  const token = getToken() ?? "";
  const me = useCurrentUser();

  const companyQuery = useQuery(api.interviews.listByCompany, me?.role === "company" && token ? { token } : "skip");
  const studentQuery = useQuery(api.interviews.listByStudent, me?.role === "student" && token ? { token } : "skip");

  const cancelInterview = useMutation(api.interviews.cancel);
  const selectSlot = useMutation(api.interviews.selectSlot);
  const [selectingId, setSelectingId] = useState<Id<"interviews"> | null>(null);

  const items = me?.role === "company" ? companyQuery : studentQuery;

  if (!items) return <TableSkeleton rows={3} />;

  const handleSelectSlot = async (interviewId: Id<"interviews">, slot: number) => {
    if (!token) return;
    setSelectingId(interviewId);
    try {
      await selectSlot({ token, interviewId, slot });
    } catch { console.debug("slot select error"); }
    setSelectingId(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
    };
    const labels: Record<string, string> = {
      pending: "بانتظار التأكيد",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "مكتمل",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-h2 mb-2">المقابلات</h1>
      <p className="text-text-secondary mb-8">
        {me?.role === "company" ? "إدارة مقابلات المرشحين وجدولتها." : "مقابلاتك المجدولة مع الشركات."}
      </p>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا توجد مقابلات</p>
          <p className="text-sm text-text-muted">
            {me?.role === "company" ? "حدد موعد مقابلة مع مرشح من صفحة ملفه الشخصي." : "عندما تحدد شركة مقابلة معك، ستظهر هنا."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((interview) => (
            <div key={interview._id} className="bg-white rounded-2xl border border-border-light p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {interview.studentName || interview.companyName}
                  </h3>
                  {interview.notes && (
                    <p className="text-sm text-text-secondary mt-1">{interview.notes}</p>
                  )}
                </div>
                {statusBadge(interview.status)}
              </div>

              <p className="text-xs text-text-muted mb-3">المواعيد المقترحة:</p>
              <SlotPicker
                slots={interview.proposedSlots}
                selected={interview.selectedSlot}
                onSelect={(slot) => handleSelectSlot(interview._id, slot)}
              />

              {interview.status === "pending" && me?.role === "company" && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={async () => {
                      try { await cancelInterview({ token, interviewId: interview._id }); } catch { console.debug("cancel error"); }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>إلغاء المقابلة</span>
                  </button>
                </div>
              )}

              {interview.status === "pending" && me?.role === "student" && selectingId === interview._id && (
                <div className="mt-3 text-center text-sm text-text-secondary">
                  <Loader2 size={16} className="inline animate-spin ml-1" />
                  جاري تأكيد الموعد...
                </div>
              )}

              {interview.selectedSlot && (
                <div className="mt-4 bg-brand/5 rounded-xl p-3 flex items-center gap-2 text-sm text-brand font-medium">
                  <CheckCircle size={16} />
                  <span>تم تأكيد الموعد: {formatDate(interview.selectedSlot)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
