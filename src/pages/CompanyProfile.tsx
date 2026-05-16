import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Building2, Globe, Phone, Mail, BadgeCheck, Hash, Activity, Clock, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

export default function CompanyProfileView() {
  const { companyId } = useParams<{ companyId: string }>();

  const company = useQuery(
    api.search.getCompanyProfileById,
    companyId ? { companyId: companyId as Id<"users"> } : "skip",
  );

  if (!company) {
    return (
      <div className="min-h-screen pt-[72px] bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const infoCards = [
    { icon: Building2, label: "اسم الشركة", value: company.companyName || "—" },
    { icon: Hash, label: "السجل التجاري", value: company.commercialRegistration || "—" },
    { icon: Activity, label: "مجال العمل", value: company.activities || "—" },
    { icon: Globe, label: "الموقع الإلكتروني", value: company.website, link: company.website },
    { icon: Mail, label: "البريد الإلكتروني", value: company.email },
    { icon: Phone, label: "رقم التواصل", value: company.contactNumber || "—" },
    { icon: Clock, label: "عمر الشركة", value: company.companyAge || "—" },
  ];

  return (
    <div className="min-h-screen pt-[72px] bg-surface">
      <SEO
        title={company.companyName || "شركة"}
        description={company.activities ? `تعرف على ${company.companyName} — ${company.activities}` : ""}
      />
      <div className="container-main py-12 md:py-16">
        <Link to="/jobs" className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand mb-6 transition-colors">
          <ArrowRight size={16} />
          العودة إلى الوظائف
        </Link>

        <div className="bg-gradient-to-br from-brand via-brand to-brand-light rounded-3xl p-8 md:p-10 text-white mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-80 h-80 bg-white/[0.07] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Building2 size={34} />
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{company.companyName}</h1>
                  {company.verified && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                      <BadgeCheck size={14} />
                      موثّق
                    </span>
                  )}
                </div>
                {company.activities && (
                  <p className="text-white/70 text-sm mt-1">{company.activities}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {infoCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-border-light p-5">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand/[0.06] flex items-center justify-center text-brand shrink-0">
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted mb-0.5">{card.label}</p>
                    {card.link ? (
                      <a
                        href={card.link.startsWith("http") ? card.link : `https://${card.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand font-medium hover:underline break-words"
                      >
                        {card.value}
                      </a>
                    ) : card.label === "البريد الإلكتروني" ? (
                      <p className="text-sm text-text-primary font-medium break-words" dir="ltr">{card.value}</p>
                    ) : (
                      <p className="text-sm text-text-primary font-medium break-words">{card.value}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
