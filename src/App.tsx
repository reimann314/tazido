import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import AIAssistant from "./components/AIAssistant";
import AnnouncementBanner from "./components/AnnouncementBanner";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import ForCompanies from "./pages/ForCompanies";
import ForTalent from "./pages/ForTalent";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import CompanyProfile from "./pages/CompanyProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPage from "./pages/admin/AdminPage";
import AdminGuard from "./components/AdminGuard";
import RequireAuth from "./components/RequireAuth";
import RedirectIfAuth from "./components/RedirectIfAuth";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route path="/*" element={<PublicApp />} />
      </Routes>
    </BrowserRouter>
  );
}

function PublicApp() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AnnouncementBanner />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/for-companies" element={<ForCompanies />} />
          <Route path="/for-talent" element={<ForTalent />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<RedirectIfAuth><Auth /></RedirectIfAuth>} />
          <Route path="/login" element={<RedirectIfAuth><Auth /></RedirectIfAuth>} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies/:companyId" element={<CompanyProfile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </div>
      <Footer />
      <CookieConsent />
      <AIAssistant />
    </div>
  );
}

export default App;
