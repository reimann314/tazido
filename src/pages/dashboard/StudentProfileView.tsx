import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken } from "../../lib/auth";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ArrowRight, User, Mail, Phone, CreditCard, GraduationCap, BookOpen,
  Star, Globe, Heart, Briefcase, Building2, FileText, ExternalLink,
  Bookmark, Loader2,
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
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

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
            <div className="flex items-center gap-2">
              {profile.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
                >
                  <FileText size={16} />
                  <span>تحميل CV</span>
                  <ExternalLink size={14} />
                </a>
              )}
              {isShortlisted || added ? (
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30">
                  <Bookmark size={16} />
                  في القائمة المختصرة
                </span>
              ) : (
                <button
                  onClick={handleAddShortlist}
                  disabled={adding}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 disabled:opacity-60 transition-colors"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} />}
                  <span>إضافة للقائمة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
