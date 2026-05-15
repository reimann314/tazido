import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import {
  User, CreditCard, Mail, Phone, GraduationCap, BookOpen, Star, Globe, Heart, Briefcase, Building2, Shield, Send, CheckCircle, XCircle, Pencil,
} from "lucide-react";
import UploadCV from "../../components/UploadCV";

type FieldDef = {
  icon: React.ElementType;
  label: string;
  field: string;
  desc: string;
  type?: string;
};

const items: FieldDef[] = [
  { icon: User, label: "اسم الطالب", field: "name", desc: "الاسم الكامل كما في الهوية الوطنية" },
  { icon: CreditCard, label: "السجل المدني", field: "nationalId", desc: "رقم الهوية الوطنية" },
  { icon: Mail, label: "الايميل", field: "email", desc: "البريد الإلكتروني الشخصي" },
  { icon: Phone, label: "رقم الجوال", field: "mobileNumber", desc: "رقم الجوال مسبوق بـ 05" },
  { icon: GraduationCap, label: "السنة الدراسية", field: "academicLevel", desc: "جامعي أو ثانوي" },
  { icon: BookOpen, label: "التخصص", field: "specialization", desc: "التخصص الدراسي الحالي" },
  { icon: Star, label: "المهارات", field: "skills", desc: "المهارات التقنية والشخصية", type: "textarea" },
  { icon: Globe, label: "اللغات", field: "languages", desc: "اللغات التي تجيدها ومستوى كل منها", type: "textarea" },
  { icon: Heart, label: "الهوايات", field: "hobbies", desc: "الهوايات والاهتمامات الشخصية", type: "textarea" },
  { icon: Briefcase, label: "الخبرات", field: "experiences", desc: "الخبرات السابقة إن وجدت", type: "textarea" },
  { icon: Building2, label: "الجهة", field: "entityType", desc: "الجهة المنتسب إليها (جامعة / ثانوية / جمعية / أخرى)" },
];

export default function StudentFolder() {
  const me = useCurrentUser();
  const token = getToken() ?? "";
  const updateProfile = useMutation(api.users.updateStudentProfile);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (me) {
      setFormData({
        name: me.name ?? "",
        nationalId: me.nationalId ?? "",
        mobileNumber: me.mobileNumber ?? "",
        academicLevel: me.academicLevel ?? "",
        specialization: me.specialization ?? "",
        skills: me.skills ?? "",
        languages: me.languages ?? "",
        hobbies: me.hobbies ?? "",
        experiences: me.experiences ?? "",
        entityType: me.entityType ?? "",
        entityName: me.entityName ?? "",
        university: me.university ?? "",
      });
    }
  }, [me]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setDone(false);
    try {
      await updateProfile({ token, ...formData });
      setDone(true);
      setEditing(false);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (!me) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-brand via-brand to-brand-light rounded-3xl p-10 md:p-12 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.07] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.05] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gold/[0.08] rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <User size={34} />
              </span>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">الملف الشخصي</h1>
                <p className="text-white/70 text-base md:text-lg mt-1">صفحة تسجيل الطلاب</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-full text-sm font-medium hover:bg-white/25 transition-all"
              >
                <Pencil size={16} />
                <span>تعديل</span>
              </button>
            )}
          </div>
          <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-7 md:p-8 border border-white/[0.06]">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center shrink-0 mt-1">
                <Send size={22} className="text-gold" />
              </span>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-gold">إكمال الملف الشخصي</h3>
                <p className="text-white/85 text-base md:text-lg leading-[1.8]">
                  قم بتحديث معلوماتك الشخصية والمهنية مباشرة من هنا. بمجرد اكتمال ملفك،
                  سنبدأ فوراً بمطابقتك مع الفرص المتاحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <span className="w-4 h-4 rounded-full bg-gold animate-pulse shadow-[0_0_12px_rgba(200,165,100,0.5)]" />
        <span className="text-base md:text-lg font-bold text-text-primary">
          {editing ? "تعديل الملف الشخصي" : "الملف الشخصي"}
        </span>
        <span className="hidden sm:inline text-sm md:text-base text-text-muted">
          {editing ? "— قم بتحديث معلوماتك أدناه" : "— المعلومات والمستندات المطلوبة لإكمال تسجيلك"}
        </span>
      </div>

      {done && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">تم حفظ التغييرات بنجاح</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 flex items-center gap-3">
          <XCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-10">
            {items.map((item) => {
              const Icon = item.icon;
              const value = formData[item.field] ?? "";
              return (
                <div key={item.field} className="bg-white rounded-2xl border border-border-light p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                      <Icon size={28} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-base md:text-lg font-bold text-text-primary mb-1.5">{item.label}</label>
                      {item.field === "academicLevel" ? (
                        <select
                          value={value}
                          onChange={(e) => handleChange(item.field, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand transition-colors text-sm"
                        >
                          <option value="">اختر السنة الدراسية</option>
                          <option value="university">جامعي</option>
                          <option value="high-school">ثانوي</option>
                        </select>
                      ) : item.type === "textarea" ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleChange(item.field, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand transition-colors text-sm resize-none"
                        />
                      ) : item.field === "email" ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-border-light bg-gray-50 text-text-secondary text-sm">
                          {value}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleChange(item.field, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand transition-colors text-sm"
                        />
                      )}
                      <p className="text-xs text-text-secondary mt-1.5">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mb-10">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark disabled:opacity-60 transition-all"
            >
              {submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              className="px-8 py-3 rounded-xl border border-border-light text-text-secondary font-medium hover:bg-surface transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-10">
            {items.map((item) => {
              const Icon = item.icon;
              const value = formData[item.field] || "—";
              return (
                <div key={item.field} className="group bg-white rounded-2xl border border-border-light p-6 md:p-7 hover:border-brand/25 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/[0.10] transition-all">
                      <Icon size={28} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-bold text-text-primary mb-1.5">{item.label}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed mb-1">
                        {item.field === "academicLevel"
                          ? value === "university" ? "جامعي" : value === "high-school" ? "ثانوي" : value
                          : value}
                      </p>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-10 max-w-lg">
            <UploadCV />
          </div>

          <div className="bg-surface rounded-2xl border border-border-light p-8 md:p-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Shield size={24} />
              </span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-text-primary mb-3">الخصوصية وحماية البيانات</h4>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-[1.9]">
              جميع معلوماتك الشخصية محمية وفقاً لسياسة الخصوصية ولائحة حماية البيانات الشخصية.
              لن يتم مشاركة بياناتك مع أي جهة دون موافقتك المسبقة.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
