import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap, Users, TrendingUp, BookOpen, Palette, Code, BarChart3, Gavel, Megaphone, Cpu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const specializations = [
  { label: "هندسة", sub: "ENGINEERING", icon: Cpu },
  { label: "إدارة أعمال", sub: "BUSINESS", icon: BarChart3 },
  { label: "تصميم", sub: "DESIGN", icon: Palette },
  { label: "تقنية", sub: "TECHNOLOGY", icon: Code },
  { label: "تسويق", sub: "MARKETING", icon: Megaphone },
  { label: "مالية", sub: "FINANCE", icon: BarChart3 },
  { label: "بيانات", sub: "DATA", icon: BookOpen },
  { label: "قانون", sub: "LAW", icon: Gavel },
];

const benefits = [
  {
    icon: GraduationCap,
    title: "فرص بتخصصك",
    desc: "تزيد تطابق بينك وبين فرص الشركات بناءً على تخصصك الجامعي — الفرصة الصحيحة للشخص الصحيح.",
  },
  {
    icon: Users,
    title: "إشراف واحتراف",
    desc: "ستعمل تحت إشراف مستشارين ذوي خبرة يدعمونك فنياً ومهنياً طوال فترة إقامتك.",
  },
  {
    icon: TrendingUp,
    title: "طريق للتوظيف",
    desc: "أثبت كفاءتك بالعمل الفعلي — والشركة ستوظّفك مباشرة. قرار مبني على ما فعلته، لا على ما كتبته.",
  },
];

export default function ForTalent() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".talent-card").forEach((card, i) => {
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

  return (
    <main>
      {/* Hero */}
      <section className="pt-[120px] pb-20 bg-surface">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-pure border border-border-light rounded-full mb-6">
                <span className="w-2 h-2 bg-brand" />
                <span className="text-text-secondary text-xs">للمواهب والطلاب</span>
              </div>
              <h1 className="text-display text-text-primary mb-6">
                اعمل في شركة حقيقية.
                <br />
                بتخصصك الجامعي.
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-lg">
                لا تنتظر التخرج لتبدأ. انضم لتزيد، اعمل كمتدرب مقيم في شركة
                سعودية تناسب تخصصك — وطريقك للوظيفة الكاملة يبدأ من أول يوم.
              </p>
              <Link to="/for-talent" className="btn-primary">
                <span>قدّم كطالب</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="rounded-3xl overflow-hidden h-[400px]">
              <img
                src="/images/Hero-2.webp"
                alt="طالب يعمل"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={sectionRef} className="section-padding bg-surface-pure">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="talent-card bg-surface-pure rounded-3xl p-8 border border-border-light shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="section-padding bg-surface">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-text-primary">
              كل التخصصات مرحّب بها.
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl mx-auto leading-relaxed">
              هندسة أو تصميم أو إدارة أو قانون أو تقنية — لا يهم ما تدرس. هدف
              تزيد هو مساعدة كل طالب على بناء خبرة مهنية حقيقية قبل أن يتخرج.
              الشركات تبحث عن كل التخصصات، وفرصتك موجودة بانتظارك.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specializations.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="bg-surface-pure rounded-2xl p-6 border border-border-light text-center hover:border-brand/30 hover:shadow-card transition-all duration-300"
                >
                  <Icon className="w-6 h-6 text-brand mx-auto mb-3" />
                  <span className="font-latin text-xs text-brand/60 block mb-1 tracking-wider">
                    {spec.sub}
                  </span>
                  <span className="text-text-primary font-semibold">
                    {spec.label}
                  </span>
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
            لا تنتظر موسم التخرج. قدّم طلبك اليوم وابدأ رحلتك المهنية.
          </p>
          <Link to="/for-talent" className="btn-dark inline-flex">
            <span>قدّم كطالب</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
