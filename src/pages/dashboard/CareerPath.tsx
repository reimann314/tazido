import { useCurrentUser } from "../../lib/auth";
import { Target, BookOpen, TrendingUp, Lightbulb } from "lucide-react";

export default function CareerPath() {
  const me = useCurrentUser();
  if (!me) return null;

  const skills = me.skills || "";
  const experiences = me.experiences || "";
  const specialization = me.specialization || "";
  const academicLevel = me.academicLevel || "";

  const tips: { icon: React.ReactNode; title: string; body: string }[] = [];

  if (academicLevel) {
    tips.push({
      icon: <BookOpen size={20} />,
      title: "المستوى الأكاديمي",
      body: academicLevel === "university" ? "أنت في المرحلة الجامعية — ركز على بناء مهارات عملية عبر التدريب." : "المرحلة الثانوية — ابدأ باستكشاف المجالات التي تناسب اهتماماتك.",
    });
  }

  if (skills) {
    const skillCount = skills.split(/[،,]/).filter(Boolean).length;
    tips.push({
      icon: <Lightbulb size={20} />,
      title: "مهاراتك",
      body: `لديك ${skillCount} مهارة مسجلة. قم بتحديثها دورياً لتعكس تطورك.`,
    });
  }

  tips.push({
    icon: <Target size={20} />,
    title: "الخطوة التالية",
    body: specialization ? `تخصصك في ${specialization} — ابحث عن فرص عملية واكتسب خبرة ميدانية.` : "حدّث ملفك الشخصي بإضافة تخصصك ومهاراتك.",
  });

  tips.push({
    icon: <TrendingUp size={20} />,
    title: "نصيحة مهنية",
    body: experiences ? "لديك خبرات سابقة — أبرزها في سيرتك الذاتية واربطها بالفرص المتاحة." : "ابحث عن فرص تدريب لاكتساب خبرة عملية في مجالك.",
  });

  return (
    <div>
      <h1 className="text-h2 mb-2">المسار المهني</h1>
      <p className="text-text-secondary mb-8">خطواتك المقترحة لتطوير مسارك المهني.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {tips.map((tip, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border-light p-6">
            <span className="w-12 h-12 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand mb-4">
              {tip.icon}
            </span>
            <h3 className="font-bold text-text-primary mb-2">{tip.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-brand/[0.03] border border-brand/10 rounded-2xl p-6">
        <h3 className="font-bold text-text-primary mb-3">مسارات مقترحة حسب مهاراتك</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          بناءً على بيانات ملفك الشخصي، نوصي باستكشاف المجالات التي تتناسب مع مهاراتك واهتماماتك.
          قم بتحديث ملفك باستمرار للحصول على توصيات أكثر دقة.
        </p>
      </div>
    </div>
  );
}
