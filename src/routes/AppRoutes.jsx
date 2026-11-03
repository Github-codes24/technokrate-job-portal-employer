import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";

// Layout + Pages
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../modules/dashboard/Dashboard";
import Settings from "../modules/Settings/Settings";
import SavedSearch from "../modules/database/SavedSearch";
import SearchCandidate from "../modules/database/searchCandidate/SearchCandidate";
import UnlockedCandidate from "../modules/database/UnlockedCandidate";
import FIlteredSearchCandidate from "../modules/database/searchCandidate/FIlteredSearchCandidate";
import MyJobs from "../modules/myJobs/MyJobs";
import AddJob from "../modules/myJobs/AddJob";
import JobDetail from "../modules/myJobs/JobDetail";
import Applicants from "../modules/myJobs/Applicants";
import DatabaseMatches from "../modules/myJobs/DatabaseMatches";
import CreditUsage from "../modules/planAndBilling/CreditUsage";
import BillingDetail from "../modules/planAndBilling/BillingDetail";
import Subscription from "../modules/planAndBilling/Subscription";
import Checkout from "../modules/planAndBilling/CheckOut";
import Notification from "../modules/Notification/Notification";
import EditJob from "../modules/myJobs/EditJob";
import CompanyProfile from "../modules/companyProfile/CompanyProfile";
import EditCompanyProfile from "../modules/companyProfile/EditCompanyProfile";
import ApplicantDetail from "../modules/myJobs/ApplicantDetail";
import CandidateDetail from "../modules/database/searchCandidate/CandidateDetail";
import TermsAndCondition from "../modules/LegalDocuments/TermsAndCondition";
import PrivacyPolicy from "../modules/LegalDocuments/PrivacyPolicy";
import PaymentMethod from "../modules/planAndBilling/PaymentMethod";
import PaymentStatus from "../modules/planAndBilling/PaymentStatus";
import Invoice from "../modules/invoice/Invoice";
import StaffingManagement from "../modules/staffing/StaffingManagement";
import StaffingDetail from "../modules/staffing/StaffingDetail";
import VacanciesList from "../modules/vacancies/VacanciesList";

const AppRoutes = () => {
  return (
    <Routes>

      {/* 🔓 PUBLIC ROUTES */}
      {PublicRoutes()}
      <Route path="terms-and-conditions" element={<TermsAndCondition />} />
      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      {/* 🔒 PROTECTED ROUTES */}
      <Route element={<ProtectedRoutes />}>

        <Route path="/" element={<MainLayout />}>

          {/* Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />

          {/* Staffing (Sales Member) & Companies */}
          <Route path="staffing" element={<StaffingManagement />} />
          <Route path="staffing/:staffingId" element={<StaffingDetail />} />

          {/* Current Vacancies */}
          <Route path="vacancies" element={<VacanciesList />} />

          {/* Database */}
          <Route path="database" element={<Navigate to="/database/search" replace />} />
          <Route path="database/saved" element={<SavedSearch />} />
          <Route path="database/search" element={<SearchCandidate />} />
          <Route path="database/search/filtered" element={<FIlteredSearchCandidate />} />
          <Route path="database/search/filtered/:id" element={<CandidateDetail/>} />
          <Route path="database/unlocked" element={<UnlockedCandidate />} />

          {/* My Jobs */}
          <Route path="my-job" element={<MyJobs />} />
          <Route path="my-jobs" element={<Navigate to="/my-job" replace />} />
          <Route path="my-job/add" element={<AddJob />} />
          <Route path="my-job/detail/:id" element={<JobDetail />} />
          <Route path="my-job/applicant/:id" element={<Applicants />} />
          <Route path="my-job/applicant-detail/:jobseekerId" element={<ApplicantDetail />} />
          <Route path="my-job/dbmatch/:id" element={<DatabaseMatches />} />
          <Route path="my-job/edit/:id" element={<EditJob />} />

          {/* Plans */}
          <Route path="plan" element={<Navigate to="/plan/subscription" replace />} />
          <Route path="plans" element={<Navigate to="/plan/subscription" replace />} />
          <Route path="plan/credit-usage" element={<CreditUsage />} />
          <Route path="plan/billing" element={<BillingDetail />} />
          <Route path="plan/subscription" element={<Subscription />} />
          <Route path="plan/checkout" element={<Checkout />} />
          <Route path="plan/payment" element={<PaymentMethod/>}/>
          <Route path="plan/payment-status" element={<PaymentStatus/>} />
          <Route path="plan/invoice" element={<Invoice/>} />

          {/* Notifications */}
          <Route path="notification" element={<Notification />} />

          {/* Company Profile (PROTECTED) */}
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="company-profile/edit" element={<EditCompanyProfile />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />

        </Route>

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default AppRoutes;
