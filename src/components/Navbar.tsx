import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  const isHome = location.pathname === "/";

  const navLinks = [
    { label: "السوق", href: "/" },
    { label: "كيف نعمل", href: "/how-it-works" },
    { label: "للشركات", href: "/for-companies" },
    { label: "للطلاب", href: "/for-talent" },
    { label: "عن تزيد", href: "/about" },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 right-0 left-0 z-50 h-[72px] transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-surface/90 backdrop-blur-xl border-b border-border-light"
          : "bg-transparent"
      }`}
    >
      <div className="container-main h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span
            className={`text-xl font-semibold uppercase tracking-[0.3em] transition-colors duration-300 ${
              scrolled || !isHome ? "text-text-primary" : "text-white"
            }`}
          >
            TAZID
          </span>
          <span
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              scrolled || !isHome ? "bg-brand" : "bg-gold"
            }`}
          />
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium relative group transition-colors duration-300 ${
                scrolled || !isHome ? "text-text-primary" : "text-white/90"
              } ${location.pathname === link.href ? "font-semibold" : ""}`}
            >
              {link.label}
              <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className={`text-sm font-medium transition-colors duration-300 ${
              scrolled || !isHome ? "text-text-primary hover:text-brand" : "text-white/90 hover:text-white"
            }`}
          >
            دخول
          </Link>
          <Link
            to="/signup?role=company"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              scrolled || !isHome
                ? "bg-brand text-white hover:bg-brand-dark"
                : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
            }`}
          >
            سجّل شركتك
          </Link>
        </div>

        {/* Mobile menu button */}
        <MobileMenu navLinks={navLinks} />
      </div>
    </nav>
  );
}

function MobileMenu({ navLinks }: { navLinks: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-text-primary"
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-[72px] right-0 left-0 bg-surface border-b border-border-light p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-text-primary hover:text-brand transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/signup?role=company"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
            >
              سجّل شركتك
            </Link>
            <Link
              to="/signup?role=student"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300"
            >
              انضم كطالب
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-text-secondary hover:text-brand transition-colors text-center mt-1"
            >
              لديك حساب؟ تسجيل الدخول
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
