import { Shield, Building2, FileText, Calendar, Clock, Upload, FileCheck, Phone, Mail, Hash, Activity } from "lucide-react";

export default function EntityProfile() {
  const documents = [
    { icon: Building2, label: "الاسم للشركة", field: "companyName", desc: "الاسم التجاري للشركة كما هو في السجل" },
    { icon: Hash, label: "رقم السجل التجاري", field: "commercialRegistration", desc: "الرقم الصادر من وزارة التجارة" },
    { icon: Activity, label: "أعمال ومهام الشركة", field: "activities", desc: "وصف مختصر لنشاط الشركة ومجالات عملها" },
    { icon: Calendar, label: "تاريخ سريان السجل التجاري", field: "crValidityDate", desc: "تاريخ إصدار وانتهاء السجل التجاري" },
    { icon: Clock, label: "عمر الشركة أو المؤسسة", field: "companyAge", desc: "عدد سنوات تأسيس الشركة" },
    { icon: Upload, label: "تحميل ملف الشركة", field: "companyProfileFile", desc: "ملف تعريفي بالشركة (PDF - حد أقصى 10MB)" },
    { icon: FileCheck, label: "تحميل السجل التجاري", field: "crFile", desc: "نسخة من السجل التجاري (PDF - حد أقصى 10MB)" },
    { icon: FileText, label: "شهادة الزكاة", field: "zakatCertificate", desc: "شهادة الزكاة والدخل سارية المفعول" },
    { icon: FileText, label: "شهادة الضريبة", field: "taxCertificate", desc: "شهادة التسجيل في ضريبة القيمة المضافة" },
    { icon: Mail, label: "الايميل", field: "email", desc: "البريد الإلكتروني الرسمي للشركة" },
    { icon: Phone, label: "رقم التواصل", field: "contactNumber", desc: "رقم الجوال المسؤول (مثال: 05xxxxxxxx)" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand via-brand to-brand-light rounded-3xl p-10 md:p-12 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/[0.07] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/[0.05] rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gold/[0.08] rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Shield size={34} />
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">ملف المنشئة</h1>
              <p className="text-white/70 text-base md:text-lg mt-1">الشركات أو المؤسسات</p>
            </div>
          </div>
          <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-white/[0.06] hover:bg-white/[0.10] transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center shrink-0 mt-1">
                <Shield size={22} className="text-gold" />
              </span>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-gold">تأمين وأمان البيانات</h3>
                <p className="text-white/85 text-base md:text-lg leading-[1.8]">
                  حرصاً على أمن وسرية بيانات منشأتك، نتبع بروتوكولات أمان صارمة لضمان حماية معلوماتك.
                  سيتم جدولة اجتماع مع ممثلنا المعتمد لتوثيق الحساب والتحقق من المستندات.
                  بعد الاجتماع، سنرسل لك رابطاً آمناً مخصصاً لرفع المستندات المطلوبة بشكل مشفر
                  لضمان أن كل شيء ١٠٠٪ آمن ومحمي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-10">
        <span className="w-4 h-4 rounded-full bg-gold animate-pulse shadow-[0_0_12px_rgba(200,165,100,0.5)]" />
        <span className="text-base md:text-lg font-bold text-text-primary">بداية التسجيل</span>
        <span className="hidden sm:inline text-sm md:text-base text-text-muted">— المستندات المطلوبة لإكمال ملف المنشئة</span>
      </div>

      {/* Documents Grid */}
      <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-10">
        {documents.map((doc, i) => {
          const Icon = doc.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-border-light p-6 md:p-7 hover:border-brand/25 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                  <Icon size={28} />
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-text-primary mb-1.5">{doc.label}</h4>
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed">{doc.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
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
    </div>
  );
}
