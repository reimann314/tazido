import { useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../lib/auth";
import {
  LayoutDashboard, Briefcase, FileText, Settings,
  TrendingUp, Users, Award, PhoneCall, Building2, GraduationCap,
  FolderOpen, X, Menu,
} from "lucide-react";
import StudentDashboard from "./StudentDashboard";
import CompanyDashboard from "./CompanyDashboard";
import EntityProfile from "./EntityProfile";
import StudentFolder from "./StudentFolder";

type Page = "dashboard" | "entity-profile" | "student-folder" | "applications" | "candidates" | "reports" | "team" | "career" | "skills" | "settings";

type NavItem = {
  label: string;
  key: Page;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

const COMING_SOON_MSG = "قريباً - سيتم تفعيل هذه الميزة مع عملائنا الأوائل، وهي غير متاحة لجميع المستخدمين حالياً";

export default function Dashboard() {
  const me = useCurrentUser();
  if (!me) return null;

  const isStudent = me.role === "student";
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentLinks: NavItem[] = [
    { label: "الرئيسية", key: "dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "الملف الشخصي", key: "student-folder", icon: <FolderOpen size={20} /> },
    { label: "طلباتي", key: "applications", icon: <FileText size={20} />, comingSoon: true },
    { label: "المسار المهني", key: "career", icon: <TrendingUp size={20} />, comingSoon: true },
    { label: "المهارات والشهادات", key: "skills", icon: <Award size={20} />, comingSoon: true },
    { label: "الإعدادات", key: "settings", icon: <Settings size={20} />, comingSoon: true },
  ];

  const companyLinks: NavItem[] = [
    { label: "الرئيسية", key: "dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "ملف المنشئة", key: "entity-profile", icon: <FolderOpen size={20} /> },
    { label: "المرشحون", key: "candidates", icon: <Users size={20} />, comingSoon: true },
    { label: "التقارير", key: "reports", icon: <TrendingUp size={20} />, comingSoon: true },
    { label: "فريق العمل", key: "team", icon: <Users size={20} />, comingSoon: true },
    { label: "الإعدادات", key: "settings", icon: <Settings size={20} />, comingSoon: true },
  ];

  const links = isStudent ? studentLinks : companyLinks;

  const handleNavClick = (item: NavItem) => {
    if (item.comingSoon) return;
    setCurrentPage(item.key);
    setSidebarOpen(false);
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "entity-profile":
        return <EntityProfile />;
      case "student-folder":
        return <StudentFolder />;
      default:
        return isStudent ? <StudentDashboard me={me} /> : <CompanyDashboard me={me} />;
    }
  };

  const sidebar = (
    <aside className="w-72 lg:w-80 bg-white border-l border-border-light flex flex-col shrink-0 min-h-[calc(100vh-72px)]">
      <div className="p-4 lg:p-5 border-b border-border-light">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
              {isStudent ? <GraduationCap size={22} /> : <Building2 size={22} />}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary text-sm truncate">
                {isStudent ? (me.name ?? "طالب") : (me.companyName ?? "شركتك")}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {isStudent ? "طالب" : "شركة"}
              </p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-surface rounded-lg">
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              disabled={item.comingSoon}
              title={item.comingSoon ? COMING_SOON_MSG : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-right ${
                isActive
                  ? "bg-brand text-white font-medium"
                  : "text-text-secondary hover:bg-surface hover:text-text-primary"
              } ${item.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-brand/70"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {item.comingSoon && (
                <span className="mr-auto text-[10px] bg-surface/50 text-text-muted px-2 py-0.5 rounded-full shrink-0">
                  قريباً
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-1 space-y-1">
        {isStudent && (
          <Link
            to="/jobs"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
          >
            <span className="text-brand/70"><Briefcase size={20} /></span>
            <span>تصفح الوظائف</span>
          </Link>
        )}
        <button
          onClick={handleBackToDashboard}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
        >
          <span className="text-brand/70"><Briefcase size={20} /></span>
          <span>{isStudent ? "الرئيسية" : "وظائفي"}</span>
        </button>
      </div>

      <div className="p-4 border-t border-border-light">
        <a
          href="tel:0554899033"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
        >
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <PhoneCall size={16} />
          </span>
          <div className="text-right">
            <p className="font-semibold">طلب مساعدة عاجلة</p>
            <p className="text-xs text-red-500" dir="ltr">0554899033</p>
          </div>
        </a>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen pt-[72px] bg-surface flex flex-row relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-[72px] right-0 bottom-0 z-50 w-72 lg:w-80 lg:static lg:flex ${sidebarOpen ? "" : "hidden lg:flex"}`}
      >
        {sidebar}
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 bg-brand text-white shadow-lg flex items-center gap-2 px-5 py-3 rounded-full hover:bg-brand-dark"
      >
        <Menu size={20} />
        <span className="text-sm font-medium">لوحة التحكم</span>
      </button>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto min-h-[calc(100vh-72px)] max-w-full">
        {me.emailVerified !== true && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-amber-800">
              يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك بالكامل. تحقق من صندوق الوارد أو{" "}
              <Link to="/login" className="font-medium underline hover:text-amber-900">
                اضغط لإعادة إرسال رابط التفعيل
              </Link>
            </p>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}
