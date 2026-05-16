import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import { Briefcase, Calendar, User, Star, CheckCircle } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProgramItem = any;
import { TableSkeleton } from "../../components/LoadingSkeletons";

function ProgramStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "بانتظار البدء",
    active: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغي",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
          <Star size={20} className={star <= value ? "text-gold fill-gold" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

function EvaluationForm({ programId, onDone }: { programId: Id<"programs">; onDone: () => void }) {
  const token = getToken() ?? "";
  const me = useCurrentUser();
  const createEval = useMutation(api.evaluations.create);
  const [rating, setRating] = useState(0);
  const [skills, setSkills] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("الرجاء اختيار التقييم"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createEval({
        token,
        programId,
        type: me?.role === "company" ? "company_to_student" : "student_to_company",
        rating,
        skills: skills || undefined,
        attendance: attendance || undefined,
        communication: communication || undefined,
        feedback,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 space-y-4">
      <h4 className="font-bold text-text-primary">
        {me?.role === "company" ? "تقييم المتدرب" : "تقييم الشركة"}
      </h4>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <div>
        <p className="text-sm font-medium mb-1.5">التقييم العام</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      {me?.role === "company" && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium mb-1.5">المهارات</p>
            <StarRating value={skills} onChange={setSkills} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1.5">الالتزام</p>
            <StarRating value={attendance} onChange={setAttendance} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1.5">التواصل</p>
            <StarRating value={communication} onChange={setCommunication} />
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5 text-text-primary">ملاحظات</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand resize-none"
        />
      </div>
      <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all">
        {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </form>
  );
}

export default function ProgramsPage() {
  const token = getToken() ?? "";
  const me = useCurrentUser();
  const companyPrograms = useQuery(api.programs.listByCompany, me?.role === "company" && token ? { token } : "skip");
  const studentPrograms = useQuery(api.programs.listByStudent, me?.role === "student" && token ? { token } : "skip");
  const updateStatus = useMutation(api.programs.updateStatus);
  const [evaluatingId, setEvaluatingId] = useState<Id<"programs"> | null>(null);

  const programs = me?.role === "company" ? companyPrograms : studentPrograms;

  if (!programs) return <TableSkeleton rows={3} />;

  return (
    <div>
      <h1 className="text-h2 mb-2">البرامج التدريبية</h1>
      <p className="text-text-secondary mb-8">
        {me?.role === "company" ? "إدارة برامج التدريب والإقامة المهنية للمتدربين." : "برامجك التدريبية والاحترافية."}
      </p>

      {programs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="text-text-secondary font-medium mb-1">لا توجد برامج تدريبية</p>
          <p className="text-sm text-text-muted">
            {me?.role === "company" ? "عند قبول متدرب، يمكنك بدء برنامج تدريبي من ملفه الشخصي." : "عندما تبدأ شركة برنامجاً تدريبياً معك، سيظهر هنا."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(programs as ProgramItem[]).map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-border-light p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                    <Briefcase size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-text-primary">{p.title}</h3>
                    <p className="text-sm text-text-secondary">
                      {me?.role === "company" ? `المتدرب: ${p.studentName || "—"}` : `الشركة: ${p.companyName || "—"}`}
                    </p>
                  </div>
                </div>
                <ProgramStatus status={p.status} />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar size={14} />
                  <span>البداية: {p.startDate}</span>
                </div>
                {p.endDate && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Calendar size={14} />
                    <span>النهاية: {p.endDate}</span>
                  </div>
                )}
                {p.supervisorName && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <User size={14} />
                    <span>المشرف: {p.supervisorName}</span>
                  </div>
                )}
              </div>

              {p.notes && (
                <p className="text-sm text-text-secondary bg-surface rounded-xl px-4 py-2 mb-4">{p.notes}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {me?.role === "company" && p.status === "active" && (
                  <button
                    onClick={async () => {
                      try { await updateStatus({ token, programId: p._id, status: "completed" }); } catch { console.debug("update status error"); }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle size={15} />
                    <span>إنهاء البرنامج</span>
                  </button>
                )}
                {me?.role === "company" && p.status === "active" && (
                  <button
                    onClick={() => setEvaluatingId(p._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
                  >
                    <Star size={15} />
                    <span>تقييم المتدرب</span>
                  </button>
                )}
                {me?.role === "student" && p.status === "completed" && (
                  <button
                    onClick={() => setEvaluatingId(p._id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
                  >
                    <Star size={15} />
                    <span>تقييم الشركة</span>
                  </button>
                )}
              </div>

              {evaluatingId === p._id && (
                <div className="mt-4">
                  <EvaluationForm programId={p._id} onDone={() => setEvaluatingId(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
