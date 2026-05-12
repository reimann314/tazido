import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-text-primary text-white">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src="/images/logo.svg" alt="تزيد" className="h-10 w-auto" />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              البنية التشغيلية لاقتصاد المواهب في المملكة العربية السعودية. متوافقون مع رؤية ٢٠٣٠.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm">المنصة</h4>
            <ul className="space-y-3">
              {[
                { label: "كيف نعمل", href: "/how-it-works" },
                { label: "للشركات", href: "/for-companies" },
                { label: "للمواهب والطلاب", href: "/for-talent" },
                { label: "عن تزيد", href: "/about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-text-muted hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm">تواصل معنا</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@tazid.co"
                  className="text-text-muted hover:text-white text-sm transition-colors duration-200"
                >
                  hello@tazid.co
                </a>
              </li>
              <li className="text-text-muted text-sm">
                المملكة العربية السعودية
              </li>
              <li>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded text-xs text-white/80 font-latin tracking-wider">
                  VISION 2030
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                </span>
              </li>
            </ul>
          </div>

          {/* Vision */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src="/images/logo.svg" alt="تزيد" className="h-8 w-auto" />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed">
              البنية التشغيلية لاقتصاد المواهب في المملكة العربية السعودية. متوافقون مع رؤية ٢٠٣٠.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            تمكين المواهب السعودية
          </p>
          <p className="text-text-muted text-xs">
            © ٢٠٢٦ Tazid. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
