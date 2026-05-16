import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../lib/auth";
import {
  LayoutDashboard, Briefcase, FileText, Settings,
  TrendingUp, Users, Award, PhoneCall, Building2, GraduationCap,
  FolderOpen, X, Menu,   Search, Bookmark, MessageCircle, Calendar, UserCog,
} from "lucide-react";
import StudentDashboard from "./StudentDashboard";
import CompanyDashboard from "./CompanyDashboard";
import EntityProfile from "./EntityProfile";
import StudentFolder from "./StudentFolder";
import StudentApplications from "./StudentApplications";
import CareerPath from "./CareerPath";
import SkillsPage from "./SkillsPage";
import SettingsPage from "./SettingsPage";
import CandidatesPage from "./CandidatesPage";
import ReportsPage from "./ReportsPage";
import StudentSearch from "./StudentSearch";
import ShortlistsPage from "./ShortlistsPage";
import MessagesPage from "./MessagesPage";
import InterviewsPage from "./InterviewsPage";
import OffersPage from "./OffersPage";
import CompanyMembers from "./CompanyMembers";
import ProgramsPage from "./ProgramsPage";

type Page = "dashboard" | "entity-profile" | "student-folder" | "applications" | "candidates" | "student-search" | "shortlists" | "messages" | "interviews" | "offers" | "programs" | "reports" | "team" | "members" | "career" | "skills" | "settings" | "browse";

type NavItem = {
  label: string;
  key: Page;
  icon: React.ReactNode;
  comingSoon?: boolean;
};

export default function Dashboard() {
  const me = useCurrentUser();
  const navigate = useNavigate();
  if (!me) return null;

  const isStudent = me.role === "student";
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const companyLinks: NavItem[] = [
    { label: "الرئيسية", key: "dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "ملف المنشئة", key: "entity-profile", icon: <FolderOpen size={20} /> },
    { label: "البحث عن طلاب", key: "student-search", icon: <Search size={20} /> },
    { label: "المرشحون", key: "candidates", icon: <Users size={20} /> },
    { label: "القائمة المختصرة", key: "shortlists", icon: <Bookmark size={20} /> },
    { label: "الرسائل", key: "messages", icon: <MessageCircle size={20} /> },
    { label: "المقابلات", key: "interviews", icon: <Calendar size={20} /> },
    { label: "عروض التوظيف", key: "offers", icon: <Briefcase size={20} /> },
    { label: "البرامج التدريبية", key: "programs", icon: <Award size={20} /> },
    { label: "فريق العمل", key: "members", icon: <UserCog size={20} /> },
    { label: "التقارير", key: "reports", icon: <TrendingUp size={20} /> },
    { label: "الإعدادات", key: "settings", icon: <Settings size={20} /> },
  ];

  const studentLinks: NavItem[] = [
    { label: "الفرص المقترحة", key: "dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "تصفح الفرص", key: "browse", icon: <Briefcase size={20} /> },
    { label: "طلباتي", key: "applications", icon: <FileText size={20} /> },
    { label: "الرسائل", key: "messages", icon: <MessageCircle size={20} /> },
    { label: "المقابلات", key: "interviews", icon: <Calendar size={20} /> },
    { label: "عروضي", key: "offers", icon: <Briefcase size={20} /> },
    { label: "برامجي التدريبية", key: "programs", icon: <Award size={20} /> },
    { label: "المسار المهني", key: "career", icon: <TrendingUp size={20} /> },
    { label: "المهارات والشهادات", key: "skills", icon: <Award size={20} /> },
    { label: "الإعدادات", key: "settings", icon: <Settings size={20} /> },
  ];

  const links = isStudent ? studentLinks : companyLinks;

  const handleNavClick = (item: NavItem) => {
    if (item.comingSoon) return;
    if (item.key === "browse") {
      setSidebarOpen(false);
      navigate("/jobs");
      return;
    }
    setCurrentPage(item.key);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "entity-profile":
        return <EntityProfile />;
      case "student-folder":
        return <StudentFolder />;
      case "applications":
        return <StudentApplications />;
      case "career":
        return <CareerPath />;
      case "skills":
        return <SkillsPage />;
      case "settings":
        return <SettingsPage />;
      case "candidates":
        return <CandidatesPage />;
      case "reports":
        return <ReportsPage />;
      case "student-search":
        return <StudentSearch />;
      case "shortlists":
        return <ShortlistsPage />;
      case "messages":
        return <MessagesPage />;
      case "interviews":
        return <InterviewsPage />;
      case "offers":
        return <OffersPage />;
      case "members":
        return <CompanyMembers />;
      case "programs":
        return <ProgramsPage />;
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
