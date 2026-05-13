import { User, CreditCard, Mail, Phone, GraduationCap, BookOpen, Star, Globe, Heart, Briefcase, Building2, Shield, Send } from "lucide-react";

export default function StudentFolder() {
  const items = [
    { icon: User, label: "اسم الطالب", field: "name", desc: "الاسم الكامل كما في الهوية الوطنية" },
    { icon: CreditCard, label: "السجل المدني", field: "nationalId", desc: "رقم الهوية الوطنية" },
    { icon: Mail, label: "الايميل", field: "email", desc: "البريد الإلكتروني الشخصي" },
    { icon: Phone, label: "رقم الجوال", field: "mobileNumber", desc: "رقم الجوال مسبوق بـ 05" },
    { icon: GraduationCap, label: "السنة الدراسية", field: "academicLevel", desc: "جامعي أو ثانوي" },
    { icon: BookOpen, label: "التخصص", field: "specialization", desc: "التخصص الدراسي الحالي" },
    { icon: Star, label: "المهارات", field: "skills", desc: "المهارات التقنية والشخصية" },
    { icon: Globe, label: "اللغات", field: "languages", desc: "اللغات التي تجيدها ومستوى كل منها" },
    { icon: Heart, label: "الهوايات", field: "hobbies", desc: "الهوايات والاهتمامات الشخصية" },
    { icon: Briefcase, label: "الخبرات", field: "experiences", desc: "الخبرات السابقة إن وجدت" },
    { icon: Building2, label: "الجهة", field: "entityType", desc: "الجهة المنتسب إليها (جامعة / ثانوية / جمعية / أخرى)" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-brand via-brand to-brand-light rounded-3xl p-10 md:p-12 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.07] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.05] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gold/[0.08] rounded-full blur-xl" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <User size={34} />
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">الملف الشخصي</h1>
              <p className="text-white/70 text-base md:text-lg mt-1">صفحة تسجيل الطلاب</p>
            </div>
          </div>
          <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-7 md:p-8 border border-white/[0.06] hover:bg-white/[0.10] transition-all duration-300">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-full bg-gold/30 flex items-center justify-center shrink-0 mt-1">
                <Send size={22} className="text-gold" />
              </span>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold text-gold">إكمال الملف الشخصي</h3>
                <p className="text-white/85 text-base md:text-lg leading-[1.8]">
                  لإكمال تسجيلك وبدء رحلة البحث عن الفرص المناسبة، نرجو منك تجهيز المستندات والمعلومات التالية.
                  سنرسل لك رابطاً خاصاً على بريدك الإلكتروني لرفع المستندات بشكل آمن،
                  أو يمكنك إرسالها مباشرة عبر البريد الإلكتروني لفريقنا.
                  بمجرد اكتمال ملفك، سنبدأ فوراً بمطابقتك مع الفرص المتاحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-10">
        <span className="w-4 h-4 rounded-full bg-gold animate-pulse shadow-[0_0_12px_rgba(200,165,100,0.5)]" />
        <span className="text-base md:text-lg font-bold text-text-primary">انتظار إكمال الملف</span>
        <span className="hidden sm:inline text-sm md:text-base text-text-muted">— المعلومات والمستندات المطلوبة لإكمال تسجيلك</span>
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 gap-5 md:gap-6 mb-10">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group bg-white rounded-2xl border border-border-light p-6 md:p-7 hover:border-brand/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <span className="w-14 h-14 rounded-2xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0 group-hover:bg-brand/[0.10] group-hover:scale-105 transition-all duration-300">
                  <Icon size={28} />
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-text-primary mb-1.5">{item.label}</h4>
                  <p className="text-sm md:text-base text-text-secondary leading-relaxed">{item.desc}</p>
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
        <h4 className="text-lg md:text-xl font-bold text-text-primary mb-3">الخصوصية وحماية البيانات</h4>
        <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-[1.9]">
          جميع معلوماتك الشخصية محمية وفقاً لسياسة الخصوصية ولائحة حماية البيانات الشخصية.
          لن يتم مشاركة بياناتك مع أي جهة دون موافقتك المسبقة.
        </p>
      </div>
    </div>
  );
}
