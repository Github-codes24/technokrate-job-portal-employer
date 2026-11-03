import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Auth
import Login from "../modules/auth/login/Login";
import ForgetPassword from "../modules/auth/login/ForgetPassword";
import EnterOtp from "../modules/auth/login/EnterOTP";
import ResetPassword from "../modules/auth/login/ResetPassword";
import PasswordResetSuccess from "../modules/auth/login/ResetSuccess";

// Signup
import SignUp from "../modules/auth/signup/SignUp";
import SignupOtpCombined from "../modules/auth/signup/SignupOtpCombined";

// Onboarding
import CompanyDetails from "../modules/auth/signup/companyDetails/CompanyDetails";
import BusinessDetails from "../modules/auth/signup/companyDetails/BusinessDetails";
import HiringPreferences from "../modules/auth/signup/companyDetails/HiringPreferences";
import VerificationDocumentation from "../modules/auth/signup/companyDetails/VerificationDocumentation";
import AllSet from "../modules/auth/signup/companyDetails/AllSet";

const PublicRoutes = () => {
  // ✅ Use Redux state (real-time updates) instead of localStorage
  const token = useSelector((state) => state.auth.token);

  return (
    <>
      {/* Prevent logged-in users from going back to login/signup */}
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={token ? <Navigate to="/" replace /> : <SignUp />}
      />

      {/* Auth */}
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/otp" element={<EnterOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

      {/* Signup OTP */}
      <Route path="/signup-verification" element={<SignupOtpCombined />} />

      {/* Onboarding (PUBLIC) */}
      <Route path="/onboarding/company-details" element={<CompanyDetails />} />
      <Route path="/onboarding/business-details" element={<BusinessDetails />} />
      <Route path="/onboarding/hiring-preferences" element={<HiringPreferences />} />
      <Route path="/onboarding/verification" element={<VerificationDocumentation />} />
      <Route path="/onboarding/all-set" element={<AllSet />} />
    </>
  );
};

export default PublicRoutes;