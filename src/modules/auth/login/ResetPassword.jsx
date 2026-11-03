import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { resetPassword, clearError } from "../../../redux/slices/auth/SigninSlice";
import AuthLayout from "./AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/Resetpass.svg";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, resetEmail, otpVerified } = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeEmail = 
    resetEmail || sessionStorage.getItem("resetPasswordEmail") || "";
  const isOtpVerified =
    otpVerified || sessionStorage.getItem("resetPasswordOtpVerified") === "true";

  // Security check: Must verify OTP first
  useEffect(() => {
    dispatch(clearError());
    if (!isOtpVerified || !activeEmail) {
      toast.warn("Please verify OTP before resetting your password.");
      navigate("/forgot-password");
    }
  }, [isOtpVerified, activeEmail, dispatch, navigate]);

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long";
    }
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return "Password must include uppercase, lowercase, number, and special character";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await dispatch(
        resetPassword({ email: activeEmail, newPassword })
      ).unwrap();

      toast.success(
        res?.message ||
          "Password reset successfully. You can now sign in with your new password."
      );

      // Add success notification in local storage
      const oldNotifications = JSON.parse(
        localStorage.getItem("employerNotifications") || "[]"
      );
      oldNotifications.unshift({
        id: Date.now(),
        title: "Password Reset Successful",
        desc: "Your password has been reset successfully.",
        time: new Date().toLocaleString(),
        type: "success",
        read: false,
      });
      localStorage.setItem("employerNotifications", JSON.stringify(oldNotifications));
      window.dispatchEvent(new Event("notificationUpdated"));

      navigate("/password-reset-success");
    } catch (err) {
      toast.error(err || "Password reset failed");
    }
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-6">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#7900BA] leading-tight drop-shadow-[0_4px_4px_#AFAFAF66]">
          Reset<br />Password
        </h1>
      </div>

      <div className="text-center mb-6">
        <p className="font-semibold text-sm text-gray-800">
          Enter your new secure password
        </p>
        {activeEmail && (
          <p className="text-xs text-purple-700 font-medium mt-1">{activeEmail}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-medium text-sm text-gray-700 flex items-center gap-1.5 mb-1">
            <FiLock className="text-[#7900BA]" /> Enter New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-[#F7F8F9] border border-gray-200 p-3 pr-10 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showNew ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Must be 8+ chars with uppercase, lowercase, number & symbol.
          </p>
        </div>

        <div>
          <label className="font-medium text-sm text-gray-700 flex items-center gap-1.5 mb-1">
            <FiLock className="text-[#7900BA]" /> Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#F7F8F9] border border-gray-200 p-3 pr-10 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirm ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
          <div className="text-right mt-1">
            <Link to="/login" className="text-[11px] text-[#D3AB2A] font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;