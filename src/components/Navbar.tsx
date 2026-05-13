import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { clearToken, getToken, useCurrentUser } from "../lib/auth";

export default function Navbar() {
  const me = useCurrentUser();
  const navigate = useNavigate();
  const signOut = useMutation(api.auth.signOut);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = async () => {
    const token = getToken();
    if (token) {
      try { await signOut({ token }); } catch { /* ignore */ }
    }
    clearToken();
    setMobileOpen(false);
    navigate("/");
    window.location.reload();
  };

  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    }
  }, []);

  const isHome = location.pathname === "/";
  const textColor = scrolled || !isHome ? "text-text-primary" : "text-white/90";
  const logo = scrolled || !isHome ? "/images/Tazid Logo All Black.svg" : "/images/Tazid logo all white.svg";

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "الوظائف", href: "/jobs" },
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
          ? "bg-surface/95 backdrop-blur-xl border-b border-border-light"
          : "bg-transparent"
      }`}
    >
      <div className="container-main h-full flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="تزيد" className="h-9 md:h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium relative group transition-colors duration-300 ${textColor} ${
                location.pathname === link.href ? "font-semibold" : ""
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {me ? (
            <>
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  scrolled || !isHome
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                }`}
              >
                لوحة التحكم
              </Link>
              <button
                onClick={onLogout}
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled || !isHome ? "text-text-primary hover:text-brand" : "text-white/90 hover:text-white"
                }`}
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors duration-300 ${textColor} hover:text-brand`}
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
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={textColor}>
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-border-light shadow-xl max-h-[calc(100vh-72px)] overflow-y-auto">
          <div className="container-main py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-brand/5 text-brand"
                    : "text-text-primary hover:bg-surface-pure"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border-light my-4" />

            {me ? (
              <div className="space-y-2 px-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand text-sm font-bold">
                    {me.name?.[0] || me.companyName?.[0] || "م"}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">{me.name || me.companyName || "المستخدم"}</p>
                    <p className="text-xs text-text-muted">{me.role === "student" ? "طالب" : "شركة"}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all"
                >
                  لوحة التحكم
                </Link>
                <button
                  onClick={onLogout}
                  className="block w-full text-center px-5 py-3 rounded-full border border-border-light text-text-secondary text-sm font-medium hover:bg-surface-pure hover:text-red-600 transition-all"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-1">
                <Link
                  to="/signup?role=company"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-all"
                >
                  سجّل شركتك
                </Link>
                <Link
                  to="/signup?role=student"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-full border-2 border-brand text-brand text-sm font-medium hover:bg-brand hover:text-white transition-all"
                >
                  انضم كطالب
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm text-text-secondary hover:text-brand transition-colors py-2"
                >
                  لديك حساب؟ تسجيل الدخول
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
