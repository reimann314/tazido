/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { Calendar, Clock, CheckCircle, XCircle, Loader2, Building2, User, AlertTriangle, RefreshCw } from "lucide-react";
import { TableSkeleton } from "../../components/LoadingSkeletons";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }) + " " + new Date(ts).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }: { message: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600" />
          <p className="font-bold text-text-primary">تأكيد الاختيار</p>
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "تأكيد"}
          </button>
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-surface">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function RescheduleForm({ interviewId, onDone }: { interviewId: Id<"interviews">; onDone: () => void }) {
  const token = getToken() ?? "";
  const requestReschedule = useMutation(api.interviews.requestReschedule);
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [slot3, setSlot3] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toTs = (s: string) => new Date(s).getTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot1) { setError("الرجاء إدخال موعد بديل واحد على الأقل"); return; }
    const t1 = toTs(slot1);
    if (isNaN(t1)) { setError("صيغة التاريخ غير صحيحة"); return; }
    setSubmitting(true); setError(null);
    try {
      await requestReschedule({
        token, interviewId,
        slot1: t1,
        slot2: slot2 ? toTs(slot2) : undefined,
        slot3: slot3 ? toTs(slot3) : undefined,
        reason: reason || undefined,
      });
      onDone();
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ"); }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-amber-800">طلب تغيير الموعد</p>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-amber-700 mb-1 block">الموعد البديل *</label>
          <input type="datetime-local" value={slot1} onChange={(e) => setSlot1(e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-amber-700 mb-1 block">موعد بديل (اختياري)</label>
          <input type="datetime-local" value={slot2} onChange={(e) => setSlot2(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-amber-700 mb-1 block">موعد بديل (اختياري)</label>
          <input type="datetime-local" value={slot3} onChange={(e) => setSlot3(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm" />
        </div>
      </div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="سبب طلب التغيير (اختياري)" className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm resize-none" />
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60">
          {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
        <button type="button" onClick={onDone} className="px-5 py-2 rounded-lg border border-amber-200 text-amber-700 text-sm font-medium hover:bg-white">إلغاء</button>
      </div>
    </form>
  );
}

export default function InterviewsPage() {
  const token = getToken() ?? "";
  const me = useCurrentUser();
  const companyQuery = useQuery(api.interviews.listByCompany, me?.role === "company" && token ? { token } : "skip");
  const studentQuery = useQuery(api.interviews.listByStudent, me?.role === "student" && token ? { token } : "skip");
  const selectSlot = useMutation(api.interviews.selectSlot);
  const cancelInterview = useMutation(api.interviews.cancel);
  const [confirming, setConfirming] = useState<{ interviewId: Id<"interviews">; slot: number; label: string } | null>(null);
  const [selectingId, setSelectingId] = useState<Id<"interviews"> | null>(null);
  const [reschedulingId, setReschedulingId] = useState<Id<"interviews"> | null>(null);
  const items = me?.role === "company" ? companyQuery : studentQuery;
  const isCompany = me?.role === "company";

  if (!items) return <TableSkeleton rows={3} />;

  const handleSelectSlot = async () => {
    if (!confirming || !token) return;
    setSelectingId(confirming.interviewId);
    try { await selectSlot({ token, interviewId: confirming.interviewId, slot: confirming.slot }); } catch { console.debug("select error"); }
    setSelectingId(null); setConfirming(null);
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = { pending: "bg-amber-50 text-amber-700 border-amber-200", confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200", cancelled: "bg-red-50 text-red-700 border-red-200", completed: "bg-blue-50 text-blue-700 border-blue-200" };
    const l: Record<string, string> = { pending: "بانتظار التأكيد", confirmed: "مؤكد", cancelled: "ملغي", completed: "مكتمل" };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${s[status] || ""}`}>{l[status] || status}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-h2 mb-2">المقابلات</h1>
      <p className="text-text-secondary mb-8">{isCompany ? "إدارة مقابلات المرشحين وجدولتها." : "مقابلاتك المجدولة مع الشركات."}</p>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium">{isCompany ? "لا توجد مقابلات" : "لم تحدد أي شركة مقابلة بعد"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((interview: any) => (
            <div key={interview._id} className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    {isCompany ? <User size={22} /> : <Building2 size={22} />}
                  </span>
                  <div>
                    <p className="font-bold text-text-primary text-base">{isCompany ? interview.studentName : interview.companyName}</p>
                    <p className="text-xs text-text-muted">{isCompany ? "طلب مقابلة" : "دعوة مقابلة"}</p>
                  </div>
                </div>
                {statusBadge(interview.status)}
              </div>

              {interview.notes && (
                <p className="text-sm text-text-secondary bg-surface rounded-xl px-4 py-2.5 mb-4">{interview.notes}</p>
              )}

              {/* Slots */}
              <p className="text-xs text-text-muted mb-3 font-medium">{interview.status === "pending" ? "اختر الوقت المناسب لك:" : "المواعيد المقترحة:"}</p>
              <div className="space-y-2">
                {interview.proposedSlots.map((slot: number, i: number) => {
                  const isSelected = interview.selectedSlot === slot;
                  const isPending = interview.status === "pending";
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        if (!isPending || isCompany) return;
                        setConfirming({ interviewId: interview._id, slot, label: formatDate(slot) });
                      }}
                      disabled={!isPending || isCompany || selectingId === interview._id}
                      className={`w-full text-right p-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : isPending && !isCompany
                            ? "bg-white border-border-light hover:border-brand/40 hover:bg-brand/[0.02] cursor-pointer"
                            : "bg-gray-50 border-gray-200 text-gray-500 cursor-default"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected ? "bg-emerald-100 text-emerald-700" : isPending ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"
                      }`}>
                        {isSelected ? <CheckCircle size={16} /> : i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="shrink-0" />
                        <span>{formatDate(slot)}</span>
                      </div>
                      {isSelected && <CheckCircle size={16} className="mr-auto text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Company: set meeting link */}
              {interview.status === "confirmed" && isCompany && (
                <MeetingLinkForm interviewId={interview._id} existingLink={interview.meetingLink} existingInfo={interview.meetingInfo} />
              )}

              {/* Meeting link display */}
              {interview.meetingLink && interview.status === "confirmed" && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">رابط المقابلة:</p>
                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-brand underline break-all">{interview.meetingLink}</a>
                  {interview.meetingInfo && <p className="text-sm text-blue-700 mt-1">{interview.meetingInfo}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light flex-wrap">
                {interview.status === "pending" && isCompany && (
                  <button onClick={async () => { try { await cancelInterview({ token, interviewId: interview._id }); } catch { console.debug("cancel"); } }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
                    <XCircle size={15} /><span>إلغاء</span>
                  </button>
                )}
                {interview.status === "confirmed" && !isCompany && (
                  <button onClick={() => setReschedulingId(interview._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50">
                    <RefreshCw size={15} /><span>طلب تغيير الموعد</span>
                  </button>
                )}
                {selectingId === interview._id && <Loader2 size={16} className="animate-spin text-brand" />}
              </div>

              {reschedulingId === interview._id && (
                <RescheduleForm interviewId={interview._id} onDone={() => setReschedulingId(null)} />
              )}
            </div>
          ))}
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          message={`تأكيد اختيار الموعد:\n${confirming.label}`}
          onConfirm={handleSelectSlot}
          onCancel={() => setConfirming(null)}
          loading={selectingId === confirming.interviewId}
        />
      )}
    </div>
  );
}

function MeetingLinkForm({ interviewId, existingLink, existingInfo }: { interviewId: any; existingLink?: string; existingInfo?: string }) {
  const token = getToken() ?? "";
  const setMeeting = useMutation(api.interviews.setMeeting);
  const [link, setLink] = useState(existingLink || "");
  const [info, setInfo] = useState(existingInfo || "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-4 bg-white border border-border-light rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-text-primary">إضافة رابط المقابلة</p>
      <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface text-sm" />
      <textarea value={info} onChange={(e) => setInfo(e.target.value)} rows={2} placeholder="معلومات إضافية" className="w-full px-3 py-2 rounded-lg border border-border-light bg-surface text-sm resize-none" />
      <button onClick={async () => { if (!link.trim()) return; setSaving(true); try { await setMeeting({ token, interviewId, meetingLink: link.trim(), meetingInfo: info.trim() || undefined }); } catch { console.debug("save meeting"); } setSaving(false); }}
        disabled={saving || !link.trim()} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
        {saving ? "..." : "حفظ"}
      </button>
    </div>
  );
}
