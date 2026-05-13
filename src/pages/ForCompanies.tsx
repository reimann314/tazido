import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Target, Users, TrendingUp, Briefcase, LayoutDashboard } from "lucide-react";
import { useCurrentUser } from "../lib/auth";

gsap.registerPlugin(ScrollTrigger);

export default function ForCompanies() {
  const me = useCurrentUser();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".company-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      icon: Target,
      title: "تحديد التخصص الجامعي المطلوب",
      desc: "حدّد بالضبط التخصص والمهارات التي تحتاجها لفريقك.",
    },
    {
      icon: Users,
      title: "اختيار من ملفات الطلاب المرشحين",
      desc: "تصفية ذكية تجلب لك أفضل المرشحين حسب معاييرك.",
    },
    {
      icon: TrendingUp,
      title: "متابعة الأداء بتقارير دورية",
      desc: "تقارير منتظمة عن تقدم المتدرب وأدائه خلال فترة الإقامة.",
    },
    {
      icon: Briefcase,
      title: "توظيف مباشر بناءً على النتائج",
      desc: "وظّف المتدرب مباشرة بعد إثبات كفاءته بالعمل الفعلي.",
    },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="pt-[120px] pb-20 bg-surface">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-pure border border-border-light rounded-full mb-6">
                <span className="w-2 h-2 bg-brand" />
                <span className="text-text-secondary text-xs">للشركات</span>
              </div>
              <h1 className="text-display text-text-primary mb-6">
                ابحث عن الطالب المناسب
                <br />
                بالتخصص الذي تحتاجه.
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-lg">
                افتح فرصة تدريب، حدّد التخصص، وتزيد تجلب لك أفضل الطلاب.
                المتدرب يعمل معك مباشرة — وإن أثبت كفاءته، وظّفه على الفور.
              </p>
              {me ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full font-medium transition-all duration-300 hover:bg-brand-dark hover:scale-[1.02]">
                  <LayoutDashboard size={18} />
                  <span>لوحة التحكم</span>
                </Link>
              ) : (
                <Link to="/signup?role=company" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-text-primary rounded-full font-medium transition-all duration-300 hover:scale-[1.02] hover:brightness-95">
                  <span>سجّل شركتك</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
            <div className="rounded-3xl overflow-hidden h-[400px]">
              <img
                src="/images/companies-meeting.jpg"
                alt="فريق عمل"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={sectionRef} className="section-padding bg-surface-pure">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-text-primary">
              لماذا تختار تزيد لشركتك؟
            </h2>
            <p className="text-text-secondary mt-4 max-w-xl mx-auto">
              منصة مصممة لتبسيط عملية التوظيف من خلال التدريب المهني المبني على الأداء.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="company-card bg-surface-pure rounded-3xl p-8 border border-border-light shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-20 bg-brand-dark text-center">
        <div className="container-main">
          <h2 className="text-h2 text-white mb-6">
            شريكك القادم يدرس الآن.
          </h2>
          <p className="text-white/75 mb-8 max-w-lg mx-auto">
            لا تنتظر موسم التخرج. افتح فرصة تدريب اليوم واختر بالتخصص.
          </p>
          {me ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand rounded-full font-medium transition-all duration-300 hover:bg-white/90 hover:scale-[1.02]">
              <LayoutDashboard size={18} />
              <span>لوحة التحكم</span>
            </Link>
          ) : (
            <Link to="/signup?role=company" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-text-primary rounded-full font-medium transition-all duration-300 hover:scale-[1.02] hover:brightness-95">
              <span>سجّل شركتك</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
