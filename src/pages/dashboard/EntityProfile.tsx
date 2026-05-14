import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getToken, useCurrentUser } from "../../lib/auth";
import {
  Shield, Building2, FileText, Calendar, Clock, Phone, Mail, Hash, Activity, BadgeCheck, Pencil, CheckCircle, XCircle,
} from "lucide-react";

type FieldDef = {
  icon: React.ElementType;
  label: string;
  field: string;
  desc: string;
};

const documents: FieldDef[] = [
  { icon: Building2, label: "اسم الشركة", field: "companyName", desc: "الاسم التجاري للشركة كما هو في السجل" },
  { icon: Hash, label: "رقم السجل التجاري", field: "commercialRegistration", desc: "الرقم الصادر من وزارة التجارة" },
  { icon: Activity, label: "أعمال ومهام الشركة", field: "activities", desc: "وصف مختصر لنشاط الشركة ومجالات عملها" },
  { icon: Calendar, label: "تاريخ سريان السجل التجاري", field: "crValidityDate", desc: "تاريخ إصدار وانتهاء السجل التجاري" },
  { icon: Clock, label: "عمر الشركة", field: "companyAge", desc: "عدد سنوات تأسيس الشركة" },
  { icon: Mail, label: "الايميل", field: "email", desc: "البريد الإلكتروني الرسمي للشركة" },
  { icon: Phone, label: "رقم التواصل", field: "contactNumber", desc: "رقم الجوال المسؤول (مثال: 05xxxxxxxx)" },
  { icon: FileText, label: "الموقع الإلكتروني", field: "website", desc: "رابط موقع الشركة الإلكتروني" },
];

export default function EntityProfile() {
  const me = useCurrentUser();
  const token = getToken() ?? "";
  const updateProfile = useMutation(api.users.updateCompanyProfile);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (me) {
      setFormData({
        companyName: me.companyName ?? "",
        commercialRegistration: me.commercialRegistration ?? "",
        activities: me.activities ?? "",
        crValidityDate: me.crValidityDate ?? "",
        companyAge: me.companyAge ?? "",
        contactNumber: me.contactNumber ?? "",
        website: me.website ?? "",
        email: me.email ?? "",
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
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/[0.07] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/[0.05] rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gold/[0.08] rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Shield size={34} />
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">ملف المنشئة</h1>
                  {me.verified === true && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <BadgeCheck size={14} />
                      موثّق
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-base md:text-lg mt-1">الشركات أو المؤسسات</p>
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
          <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center shrink-0 mt-1">
                <Shield size={22} className="text-gold" />
              </span>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-gold">تأمين وأمان البيانات</h3>
                <p className="text-white/85 text-base md:text-lg leading-[1.8]">
                  حرصاً على أمن وسرية بيانات منشأتك، نتبع بروتوكولات أمان صارمة لضمان حماية معلوماتك.
                  جميع بياناتك مشفرة ومحمية وفق أعلى معايير الأمان.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <span className="w-4 h-4 rounded-full bg-gold animate-pulse shadow-[0_0_12px_rgba(200,165,100,0.5)]" />
        <span className="text-base md:text-lg font-bold text-text-primary">
          {editing ? "تعديل الملف" : "ملف المنشئة"}
        </span>
        <span className="hidden sm:inline text-sm md:text-base text-text-muted">
          {editing ? "— قم بتحديث بيانات منشأتك" : "— المعلومات الأساسية للمنشئة"}
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
            {documents.map((doc) => {
              const Icon = doc.icon;
              const value = formData[doc.field] ?? "";
              return (
                <div key={doc.field} className="bg-white rounded-2xl border border-border-light p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                      <Icon size={28} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-base md:text-lg font-bold text-text-primary mb-1.5">{doc.label}</label>
                      {doc.field === "email" ? (
                        <div className="w-full px-4 py-3 rounded-xl border border-border-light bg-gray-50 text-text-secondary text-sm">
                          {value}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleChange(doc.field, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-border-light bg-surface focus:outline-none focus:border-brand transition-colors text-sm"
                        />
                      )}
                      <p className="text-xs text-text-secondary mt-1.5">{doc.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 mb-6">
            <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              المستندات الرسمية (السجل التجاري، شهادة الزكاة، شهادة الضريبة، ملف الشركة) تتطلب توثيقاً يدوياً.
              سيتم التواصل معك لإتمام عملية التوثيق.
            </p>
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
            {documents.map((doc) => {
              const Icon = doc.icon;
              const value = formData[doc.field] || "—";
              return (
                <div key={doc.field} className="bg-white rounded-2xl border border-border-light p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                      <Icon size={28} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-bold text-text-primary mb-1.5">{doc.label}</h4>
                      <p className="text-sm text-text-secondary leading-relaxed mb-1">{value}</p>
                      <p className="text-xs text-text-muted">{doc.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface rounded-2xl border border-border-light p-8 md:p-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Shield size={24} />
              </span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-text-primary mb-3">سياسة الخصوصية والأمان</h4>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-[1.9]">
              جميع المستندات المرفوعة تخضع للتشفير والحماية الكاملة. لن يتم مشاركة بيانات منشأتك مع أي طرف ثالث
              دون موافقتك الخطية. يمكنك طلب حذف بياناتك في أي وقت حسب سياسة الخصوصية.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
