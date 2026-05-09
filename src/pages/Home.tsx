import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Award } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Hero ─── */
function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.2 }
      );
      gsap.fromTo(
        imageRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, y: 20, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.4)", delay: 0.8 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] bg-brand overflow-hidden flex items-center"
    >
      <div className="container-main w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-[72px]">
        {/* Image (left in RTL) */}
        <div
          ref={imageRef}
          className="relative order-2 lg:order-1 h-[400px] lg:h-[600px] rounded-l-3xl overflow-hidden"
        >
          <img
            src="/images/hero-portrait.jpg"
            alt="سعودي محترف"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-l from-brand to-transparent" />

          {/* Floating card */}
          <div
            ref={cardRef}
            className="absolute bottom-6 left-6 bg-surface-pure rounded-2xl p-4 shadow-float max-w-[220px]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-sm bg-brand" />
              <span className="text-brand font-semibold text-sm">مطابقة تخصص</span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed">
              الطالب الصحيح في المكان الصحيح.
            </p>
          </div>
        </div>

        {/* Text (right in RTL) */}
        <div ref={textRef} className="order-1 lg:order-2 text-right py-12 lg:py-0">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-gold" />
            <span className="text-gold font-medium text-sm tracking-wide">
              منصة تزيد — TAZID
            </span>
          </div>

          <h1 className="text-display text-white mb-6 drop-shadow-lg">
            سوق الطلاب
            <br />
            المتخصصين للشركات.
          </h1>

          <p className="text-white/85 text-lg leading-relaxed max-w-lg mb-8">
            تزيد تربطك بالطالب الصحيح من التخصص الذي تحتاجه — يبدأ معك كمتدرب
            مقيم، وينتهي موظفاً دائماً بناءً على أدائه.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/for-companies" className="btn-dark">
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
      </div>
    </section>
  );
}

/* ─── Ticker ─── */
function Ticker() {
  const items = [
    "سوق الطلاب المتخصصين",
    "اختر بالتخصص",
    "جرّب قبل أن توظّف",
    "برنامج رواس · مؤسسة مسك",
    "رؤية ٢٠٣٠",
    "الإقامة المهنية",
    "توظيف مباشر",
    "أفضل ١٢ من ٥٣٠",
  ];

  return (
    <div className="bg-surface-pure border-y border-border-light py-5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center mx-6 text-text-secondary text-sm font-medium">
            <span className="w-1.5 h-1.5 rotate-45 bg-brand/40 mr-6 ml-2" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── How It Works (Bento) ─── */
function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".bento-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: 1,
      title: "تحديد الاحتياجات",
      desc: "الشركة تفتح فرصة تدريب وتحدد التخصص الجامعي المطلوب، وتزيد تساعد في هيكلة البرنامج.",
    },
    {
      num: 2,
      title: "التوافق المثالي",
      desc: "تزيد تطابق المتدرب المناسب من ملفات الطلاب المرشحين بناءً على احتياج الشركة.",
    },
    {
      num: 3,
      title: "إطلاق برنامج التدريب",
      desc: "الطالب يبدأ الإقامة ويعمل على مشاريع حقيقية، مع إشراف ودعم تزيد طوال الفترة.",
    },
    {
      num: 4,
      title: "متابعة الأداء والتوظيف",
      desc: "تقارير دورية عن أداء المتدرب، وقرار التوظيف المباشر بناءً على النتائج الفعلية.",
    },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-surface">
      <div className="container-main">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-pure border border-border-light rounded-full mb-6">
            <span className="w-2 h-2 bg-brand" />
            <span className="text-text-secondary text-xs font-latin tracking-wider">HOW IT WORKS — كيف نعمل</span>
          </div>
          <h2 className="text-h2 text-text-primary">
            أربع خطوات من التخصص
            <br />
            إلى التوظيف.
          </h2>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div
            aria-hidden
            className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px border-t border-dashed border-brand/20"
          />
          {steps.map((step) => (
            <div key={step.num} className="bento-card relative flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rotate-45 bg-brand shadow-card flex items-center justify-center rounded-2xl">
                  <span className="-rotate-45 font-latin font-bold text-white text-3xl leading-none">
                    {step.num}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gold mb-4 leading-snug">
                {step.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-[220px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Two Paths ─── */
function TwoPaths() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".path-item").forEach((item) => {
        gsap.fromTo(
          item.querySelector(".path-text"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 75%" },
          }
        );
        gsap.fromTo(
          item.querySelector(".path-image"),
          { clipPath: "inset(0 0 0 100%)", opacity: 0 },
          {
            clipPath: "inset(0 0 0 0%)",
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 75%" },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-surface-pure">
      <div className="container-main space-y-24">
        {/* For Companies */}
        <div className="path-item grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="path-image rounded-3xl overflow-hidden h-[400px]">
            <img
              src="/images/companies-meeting.jpg"
              alt="اجتماع شركة"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="path-text text-right">
            <span className="text-brand font-medium text-sm mb-3 block">للشركات</span>
            <h2 className="text-h2 text-text-primary mb-4">
              ابحث عن الطالب المناسب بالتخصص الذي تحتاجه.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              افتح فرصة تدريب، حدّد التخصص، وتزيد تجلب لك أفضل الطلاب. المتدرب
              يعمل معك مباشرة — وإن أثبت كفاءته، وظّفه على الفور.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "تحديد التخصص الجامعي المطلوب",
                "اختيار من ملفات الطلاب المرشحين",
                "متابعة الأداء بتقارير دورية",
                "توظيف مباشر بناءً على النتائج",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-text-secondary text-sm">
                  <Check className="w-4 h-4 text-brand shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/for-companies" className="btn-primary">
              <span>سجّل شركتك</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* For Students */}
        <div className="path-item grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="path-text text-right order-2 lg:order-1">
            <span className="text-brand font-medium text-sm mb-3 block">للطلاب</span>
            <h2 className="text-h2 text-text-primary mb-4">
              اعمل في شركة حقيقية حسب تخصصك.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              ابحث عن فرص تناسب دراستك، قدّم طلبك، وابدأ إقامة مهنية داخل شركة
              سعودية. أثبت نفسك بالعمل — والوظيفة الكاملة تنتظرك.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "فرص مرتبطة بتخصصك الجامعي",
                "خبرة ميدانية داخل شركات حقيقية",
                "إشراف ودعم طوال فترة الإقامة",
                "طريق مباشر للتوظيف الكامل",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-text-secondary text-sm">
                  <Check className="w-4 h-4 text-brand shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/for-talent" className="btn-primary">
              <span>قدّم كطالب</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="path-image rounded-3xl overflow-hidden h-[400px] order-1 lg:order-2">
            <img
              src="/images/student-workspace.jpg"
              alt="طالب يعمل"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ─── */
function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stat-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
            delay: i * 0.08,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { value: "١٢٣٤+", label: "طالب مسجّل" },
    { value: "٥٦", label: "شركة شريكة" },
    { value: "٩٨%", label: "نسبة التوظيف بعد الإقامة" },
    { value: "١٢", label: "من أفضل ٥٣٠ مبادرة (مسك)" },
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-surface-pure">
      <div className="container-main">
        <h2 className="text-h2 text-text-primary text-center mb-16">
          أرقام تزيد تتكلم
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-card bg-surface rounded-2xl p-8 text-center border border-border-light"
            >
              <div className="text-brand text-4xl lg:text-5xl font-bold mb-3">{stat.value}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Vision Banner ─── */
function VisionBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".vision-text",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[400px] lg:h-[450px] overflow-hidden flex items-center"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/riyadh-skyline.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-brand-dark/90 to-brand/50" />
      <div className="container-main relative z-10 text-right">
        <div className="vision-text">
          <h2 className="text-h2 text-white mb-4">
            نبني جيلاً جاهزاً لقيادة الاقتصاد.
          </h2>
          <p className="text-white/80 text-lg max-w-lg mr-0 ml-auto">
            المنصة مصممة للطرفين. نسهل للشركات الوصول للكفاءات، ونفتح
            للطلاب مساراً واضحاً نحو التوظيف الكامل.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Award Section ─── */
function AwardSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".award-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-surface">
      <div className="container-main">
        <div className="award-card max-w-4xl mx-auto bg-surface-pure rounded-3xl p-8 lg:p-12 border border-border-light text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-8 h-8 text-gold" />
          </div>
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-brand" />
            <span className="text-text-secondary text-xs font-latin tracking-wider">
              MISK AWARD — مبادرة مسك
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="bg-brand-dark rounded-2xl p-8 text-white">
              <div className="text-gold font-latin text-6xl font-bold mb-2">2</div>
              <div className="text-white/80 text-sm">مؤسسة مسك</div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl lg:text-3xl font-semibold text-text-primary mb-4">
                المركز الثاني في برنامج رواس للابتكار التابع لحاضنة مسك.
              </h3>
              <p className="text-text-secondary leading-relaxed">
                فزنا بتصويت مستثمرين وتحت إشراف نخبة المبتكرين في أحد{" "}
                <span className="text-brand font-semibold">أفضل ١٢</span> مبادرة
                من أصل <span className="text-brand font-semibold">٥٣٠</span> من
                طرف مؤسسة مسك.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-brand-dark py-24 lg:py-32 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #1E3A5F 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, #0A2540 0%, transparent 50%)`
        }} />
      </div>

      <div className="container-main relative z-10 text-center">
        <div className="cta-content">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-gold" />
            <span className="text-gold text-sm font-medium">ابدأ الآن</span>
          </div>

          <h2 className="text-h2 text-white mb-6 max-w-2xl mx-auto">
            شريكك القادم
            <br />
            يدرس الآن.
          </h2>

          <p className="text-white/75 text-lg mb-10 max-w-lg mx-auto">
            لا تنتظر موسم التخرج. افتح فرصة تدريب اليوم واختر بالتخصص.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/for-companies" className="btn-dark">
              <span>سجّل شركتك</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/for-talent" className="btn-secondary">
              أنا طالب
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-white/50 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              رؤية ٢٠٣٠
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              مؤسسة مسك
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              المملكة العربية السعودية
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page Export ─── */
export default function Home() {
  return (
    <main>
      <Hero />
      <Ticker />
      <HowItWorks />
      <TwoPaths />
      <Stats />
      <VisionBanner />
      <AwardSection />
      <FinalCTA />
    </main>
  );
}
