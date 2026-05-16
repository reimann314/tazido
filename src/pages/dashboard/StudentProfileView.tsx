import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ArrowRight, User, Mail, Phone, CreditCard, GraduationCap, BookOpen,
  Star, Globe, Heart, Briefcase, Building2, FileText, ExternalLink,
  Bookmark, Loader2, MessageCircle, Award,
} from "lucide-react";

export default function StudentProfileView({
  studentId,
  onBack,
}: {
  studentId: Id<"users">;
  onBack: () => void;
}) {
  const token = getToken() ?? "";
  const profile = useQuery(api.search.getStudentProfile, token ? { token, studentId } : "skip");
  const isShortlisted = useQuery(api.shortlists.isShortlisted, token ? { token, studentId } : "skip");
  const addToShortlist = useMutation(api.shortlists.add);
  const createConversation = useMutation(api.conversations.getOrCreate);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [msgDone, setMsgDone] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddShortlist = async () => {
    setAdding(true);
    try {
      await addToShortlist({ token, studentId });
      setAdded(true);
    } catch { console.debug("addShortlist error"); }
    setAdding(false);
  };

  const sections = [
    { icon: User, label: "الاسم", value: profile.name || "—" },
    { icon: Mail, label: "البريد الإلكتروني", value: profile.email },
    { icon: Phone, label: "رقم الجوال", value: profile.mobileNumber || "—" },
    { icon: CreditCard, label: "السجل المدني", value: profile.nationalId || "—" },
    { icon: GraduationCap, label: "السنة الدراسية", value: profile.academicLevel === "university" ? "جامعي" : profile.academicLevel === "high-school" ? "ثانوي" : "—" },
    { icon: BookOpen, label: "التخصص", value: profile.specialization || "—" },
    { icon: BookOpen, label: "الجامعة", value: profile.university || "—" },
    { icon: Building2, label: "الجهة", value: profile.entityName || profile.entityType || "—" },
    { icon: Star, label: "المهارات", value: profile.skills || "—" },
    { icon: Globe, label: "اللغات", value: profile.languages || "—" },
    { icon: Heart, label: "الهوايات", value: profile.hobbies || "—" },
    { icon: Briefcase, label: "الخبرات", value: profile.experiences || "—" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors">
        <ArrowRight size={16} />
        العودة إلى نتائج البحث
      </button>

      <div className="bg-gradient-to-br from-brand via-brand to-brand-light rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.07] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <User size={34} />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{profile.name || "غير محدد"}</h1>
                <p className="text-white/70 text-sm mt-1">
                  {profile.specialization || "طالب"}
                  {profile.university && ` · ${profile.university}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={async () => {
                  setMessaging(true);
                  try {
                    await createConversation({ token, otherId: studentId });
                    setMsgDone(true);
                    setTimeout(() => setMsgDone(false), 2000);
                  } catch { console.debug("create conversation error"); }
                  setMessaging(false);
                }}
                disabled={messaging}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 disabled:opacity-60 transition-colors"
              >
                {messaging ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                <span>{msgDone ? "تم فتح المحادثة" : "رسالة"}</span>
              </button>
              <button
                onClick={() => setShowOfferForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <Briefcase size={16} />
                <span>عرض توظيف</span>
              </button>
              <button
                onClick={() => setShowProgramForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
              >
                <Award size={16} />
                <span>برنامج تدريبي</span>
              </button>
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
                >
                  <FileText size={16} />
                  <span>CV</span>
                  <ExternalLink size={14} />
                </a>
              )}
              {isShortlisted || added ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30">
                  <Bookmark size={16} />
                  في القائمة
                </span>
              ) : (
                <button
                  onClick={handleAddShortlist}
                  disabled={adding}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 disabled:opacity-60 transition-colors"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />}
                  <span>حفظ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProgramForm && (
        <ProgramForm
          token={token}
          studentId={studentId}
          onDone={() => setShowProgramForm(false)}
        />
      )}

      {showOfferForm && (
        <OfferForm
          token={token}
          studentId={studentId}
          onDone={() => setShowOfferForm(false)}
        />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.label} className="bg-white rounded-2xl border border-border-light p-5">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-text-muted mb-0.5">{section.label}</p>
                  <p className="text-sm text-text-primary font-medium break-words">{section.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfferForm({ token, studentId, onDone }: { token: string; studentId: Id<"users">; onDone: () => void }) {
  const createOffer = useMutation(api.offers.create);
  const [title, setTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [terms, setTerms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createOffer({ token, studentId, title, salary: salary || undefined, startDate, terms });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 mb-8 space-y-4">
      <h3 className="font-bold text-text-primary">عرض توظيف جديد</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">المسمى الوظيفي *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">الراتب</label>
          <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="اختياري" className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">تاريخ البداية *</label>
          <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="مثال: 2026-07-01" required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-text-primary">تفاصيل العرض والشروط</label>
        <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand resize-none" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all">
          {submitting ? "جاري الإرسال..." : "إرسال العرض"}
        </button>
        <button type="button" onClick={onDone} className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-surface transition-all">
          إلغاء
        </button>
      </div>
    </form>
  );
}

function ProgramForm({ token, studentId, onDone }: { token: string; studentId: Id<"users">; onDone: () => void }) {
  const createProgram = useMutation(api.programs.create);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createProgram({ token, studentId, title, startDate, endDate: endDate || undefined, supervisorName: supervisorName || undefined, notes: notes || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border-light p-6 mb-8 space-y-4">
      <h3 className="font-bold text-text-primary">برنامج تدريبي جديد</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1.5 text-text-primary">المسمى الوظيفي *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">تاريخ البداية *</label>
          <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="مثال: 2026-07-01" required className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">تاريخ النهاية</label>
          <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="اختياري" className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">اسم المشرف</label>
          <input type="text" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="اختياري" className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-text-primary">ملاحظات</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface text-sm focus:outline-none focus:border-brand resize-none" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 transition-all">
          {submitting ? "جاري الإرسال..." : "بدء البرنامج"}
        </button>
        <button type="button" onClick={onDone} className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary text-sm font-medium hover:bg-surface transition-all">
          إلغاء
        </button>
      </div>
    </form>
  );
}
