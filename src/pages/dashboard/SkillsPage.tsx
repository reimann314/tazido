import { useCurrentUser } from "../../lib/auth";
import { Award, BookOpen, Globe, Briefcase, Sparkles } from "lucide-react";

export default function SkillsPage() {
  const me = useCurrentUser();
  if (!me) return null;

  const sections = [
    {
      icon: <Award size={20} />,
      title: "المهارات",
      items: me.skills,
      empty: "لم تُضف أي مهارات بعد. قم بتحديث ملفك الشخصي.",
    },
    {
      icon: <Globe size={20} />,
      title: "اللغات",
      items: me.languages,
      empty: "لم تُضف أي لغات بعد.",
    },
    {
      icon: <Briefcase size={20} />,
      title: "الخبرات",
      items: me.experiences,
      empty: "لم تُضف أي خبرات بعد.",
    },
    {
      icon: <BookOpen size={20} />,
      title: "الهوايات والاهتمامات",
      items: me.hobbies,
      empty: "لم تُضف أي هوايات بعد.",
    },
  ];

  return (
    <div>
      <h1 className="text-h2 mb-2">المهارات والشهادات</h1>
      <p className="text-text-secondary mb-8">عرض وتحديث ملفك المهني.</p>

      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        {sections.map((section) => {
          const itemList = section.items
            ? section.items.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
            : [];
          return (
            <div key={section.title} className="bg-white rounded-2xl border border-border-light p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand">
                  {section.icon}
                </span>
                <h3 className="font-bold text-text-primary">{section.title}</h3>
              </div>
              {itemList.length === 0 ? (
                <p className="text-sm text-text-secondary">{section.empty}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {itemList.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-brand/[0.06] text-brand text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <Sparkles size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 mb-1">الشهادات — قريباً</p>
          <p className="text-xs text-amber-700">
            سنتيح قريباً إمكانية رفع الشهادات والوثائق الرسمية وإضافتها إلى ملفك الشخصي.
          </p>
        </div>
      </div>
    </div>
  );
}
