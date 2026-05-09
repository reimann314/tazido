import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, Search, FileCheck, Handshake, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "الشركة تفتح فرصة تدريب",
    icon: Building2,
    points: [
      "تسجيل احتياج التدريب وتحديد التخصص الجامعي المطلوب",
      "تزيد تساعد في صياغة الفرصة وهيكلة البرنامج التدريبي",
      "تحديد مدة الإقامة والأهداف والمخرجات المتوقعة",
      "نشر الفرصة على المنصة وربطها بالتخصصات الجامعية المناسبة",
    ],
  },
  {
    num: "02",
    title: "تزيد تطابق المتدرب",
    icon: Search,
    points: [
      "تصفية الطلاب حسب التخصص والمهارات المطلوبة",
      "تزيد تنشر الفرصة وتجذب الطلاب المناسبين",
      "اختيار من ملفات الطلاب المرشحين",
      "متابعة الأداء بتقارير دورية",
    ],
  },
  {
    num: "03",
    title: "الطالب يبدأ الإقامة",
    icon: FileCheck,
    points: [
      "الطالب يعمل معك في شركتك ويعمل على مشاريع حقيقية",
      "تزيد ترافقك وتزودك بالتقارير الدورية",
      "إشراف ودعم طوال فترة الإقامة",
      "اختبار مناسبة الطالب والشركة",
    ],
  },
  {
    num: "04",
    title: "الشركة توظّف مباشرة",
    icon: Handshake,
    points: [
      "تقرير نهائي عن أداء المتدرب وتوصية بالتوظيف",
      "قرار التوظيف بناءً على الأداء الفعلي",
      "توظيف مباشر بناءً على النتائج",
      "طريق مباشر للتوظيف الكامل",
    ],
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".step-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
            delay: i * 0.12,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <main>
      {/* Header */}
      <section className="pt-[120px] pb-16 bg-surface">
        <div className="container-main text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-pure border border-border-light rounded-full mb-6">
            <span className="w-2 h-2 bg-brand" />
            <span className="text-text-secondary text-xs font-latin tracking-wider">
              HOW IT WORKS — كيف نعمل
            </span>
          </div>
          <h1 className="text-display text-text-primary">
            من التخصص الجامعي
            <br />
            إلى الوظيفة الكاملة.
          </h1>
          <p className="text-text-secondary text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            نموذج تزيد يربط الطلاب بالشركات حسب التخصص الدراسي، ويحوّل فترة
            التدريب إلى مسار مهني حقيقي قائم على الأداء لا على المقابلات.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section ref={sectionRef} className="section-padding bg-surface-pure">
        <div className="container-main max-w-4xl">
          <div className="space-y-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="step-card bg-surface-pure rounded-3xl p-8 lg:p-10 border border-border-light shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex items-center gap-4 lg:w-64 shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <span className="font-latin text-brand font-bold text-lg block">
                          {step.num}
                        </span>
                        <span className="text-text-primary font-semibold">
                          {step.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <ul className="space-y-3">
                        {step.points.map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-text-secondary"
                          >
                            <Check className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
            جرّب قبل أن توظّف.
          </h2>
          <p className="text-white/75 mb-8 max-w-lg mx-auto">
            تعرّف على المتدرب وهو يعمل داخل شركتك — ثم قرّر بهدوء.
          </p>
          <Link to="/for-companies" className="btn-dark inline-flex">
            <span>سجّل شركتك</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
