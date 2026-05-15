import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Award, Eye, Lightbulb, Target, Heart, Shield, Globe } from "lucide-react";
import SEO from "../components/SEO";

gsap.registerPlugin(ScrollTrigger);

const principles = [
  { icon: Target, title: "الدقة", desc: "نطابق بالتخصص، لا بالتخمين." },
  { icon: Heart, title: "الشفافية", desc: "كل خطوة واضحة للطرفين." },
  { icon: Shield, title: "الجودة", desc: "نراقب الأداء ونضمن الالتزام." },
  { icon: Lightbulb, title: "الابتكار", desc: "نبني حلولاً رقمية متقدمة." },
  { icon: Globe, title: "الاستدامة", desc: "نساهم في تحقيق رؤية ٢٠٣٠." },
  { icon: Eye, title: "الرؤية", desc: "نرى المستقبل ونبنيه اليوم." },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".about-card").forEach((card, i) => {
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
      <SEO title="عن تزيد" description="تزيد هي المنصة التي تحول المواهب السعودية من طاقة كامنة إلى إنتاجية دافعة للنمو." />
      {/* Hero Banner */}
      <section className="pt-[120px] pb-20 bg-brand-dark text-center">
        <div className="container-main">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-gold" />
            <span className="text-gold text-xs">عن تزيد</span>
          </div>
          <h1 className="text-display text-white mb-6">
            نحن البنية التشغيلية
            <br />
            لاقتصاد المواهب.
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            تزيد هي المنصة التي تحول المواهب السعودية من طاقة كامنة إلى
            إنتاجية دافعة للنمو.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding bg-surface">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-16">
            <p className="text-text-secondary text-lg leading-relaxed">
              نحن لا نقتصر على ربط الطلاب بالشركات — بل نبني نظاماً متكاملاً
              يجعل معضلة "حاجة المتخرجين للخبرة" شيئاً من الماضي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-pure rounded-3xl p-8 border border-border-light">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                رؤيتنا
              </h3>
              <p className="text-text-secondary leading-relaxed">
                نبني سوقاً يربط الشركات السعودية بأفضل الكفاءات الطلابية حسب
                التخصص — بينما نفتح للطلاب مساراً واضحاً نحو التوظيف الكامل
                وبناء خبرة مهنية حقيقية قبل التخرج. لا انتظار، لا سير ذاتية
                فارغة، فقط أداء فعلي يُثبت الكفاءة.
              </p>
            </div>
            <div className="bg-surface-pure rounded-3xl p-8 border border-border-light">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                مبادئنا
              </h3>
              <p className="text-text-secondary leading-relaxed">
                نرتكز في عملنا على ستة مبادئ لضمان أثر مستدام يربط الكفاءة
                التشغيلية بالابتكار الأكاديمي.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Grid */}
      <section ref={sectionRef} className="section-padding bg-surface-pure">
        <div className="container-main">
          <h2 className="text-h2 text-text-primary text-center mb-16">
            المبادئ الستة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((principle, i) => {
              const Icon = principle.icon;
              return (
                <div
                  key={i}
                  className="about-card bg-surface-pure rounded-3xl p-8 border border-border-light shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {principle.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision 2030 */}
      <section className="section-padding bg-brand text-center">
        <div className="container-main">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-gold" />
            <span className="text-gold text-sm">رؤية المملكة ٢٠٣٠</span>
          </div>
          <h2 className="text-h2 text-white mb-6 max-w-2xl mx-auto">
            نساهم بشكل مباشر في تحقيق أهداف رؤية ٢٠٣٠
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            تزيد ليست مجرد منصة — نحن نساهم بشكل مباشر في تحقيق أهداف رؤية ٢٠٣٠
            من خلال تمكين الكفاءات الوطنية، وتسريع التحول الرقمي، وبناء جيل من
            المحترفين جاهز لقيادة مستقبل الاقتصاد السعودي.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm border border-white/20">
              تمكين المواهب الوطنية
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm border border-white/20">
              التحول الرقمي
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-white/90 text-sm border border-white/20">
              ريادة الاقتصاد
            </span>
          </div>
        </div>
      </section>

      {/* Award */}
      <section className="section-padding bg-surface">
        <div className="container-main">
          <div className="max-w-4xl mx-auto bg-surface-pure rounded-3xl p-8 lg:p-12 border border-border-light">
            <div className="text-center mb-8">
              <Award className="w-10 h-10 text-gold mx-auto mb-4" />
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-brand" />
                <span className="text-text-secondary text-xs font-latin tracking-wider">
                  RWAS AWARD — مبادرة مسك
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-brand-dark rounded-2xl p-8 text-center text-white">
                <div className="text-gold font-latin text-7xl font-bold mb-2">#2</div>
                <div className="text-white/80 text-sm">
                  برنامج رواس للابتكار التابع لحاضنة مسك
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-semibold text-text-primary mb-4">
                  المركز الثاني في برنامج رواس للابتكار.
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  فزنا بتصويت مستثمرين وتحت إشراف نخبة المبتكرين في أحد{" "}
                  <span className="text-brand font-semibold">أفضل ١٢</span>{" "}
                  مبادرة من أصل{" "}
                  <span className="text-brand font-semibold">٥٣٠</span> من طرف
                  مؤسسة مسك.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-dark text-center">
        <div className="container-main">
          <h2 className="text-h2 text-white mb-6">
            كن جزءاً من رحلتنا.
          </h2>
          <p className="text-white/75 mb-8 max-w-lg mx-auto">
            انضم لتزيد اليوم وكن جزءاً من بناء مستقبل اقتصاد المواهب في المملكة.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/for-companies" className="btn-dark inline-flex">
              <span>سجّل شركتك</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/for-talent" className="btn-secondary">
              أنا طالب
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
