import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  verifyOtp,
  forgotPasswordMail,
  setResetEmail,
  clearError,
} from "../../../redux/slices/auth/SigninSlice";
import AuthLayout from "./AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/enter-otp.svg";

const EnterOtp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, resetEmail } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");

  const activeEmail =
    resetEmail || sessionStorage.getItem("resetPasswordEmail") || "";

  useEffect(() => {
    dispatch(clearError());
    if (!activeEmail) {
      toast.info("Please enter your email to request an OTP");
      navigate("/forgot-password");
    } else if (!resetEmail && activeEmail) {
      dispatch(setResetEmail(activeEmail));
    }
  }, [activeEmail, resetEmail, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      toast.error("Please enter the OTP");
      return;
    }
    if (trimmedOtp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    try {
      const res = await dispatch(
        verifyOtp({ email: activeEmail, otp: trimmedOtp })
      ).unwrap();
      toast.success(
        res?.message ||
          "OTP verified successfully. You can now reset your password."
      );
      navigate("/reset-password");
    } catch (err) {
      toast.error(err || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    if (!activeEmail) {
      toast.error("Email address missing. Please request password reset again.");
      navigate("/forgot-password");
      return;
    }
    try {
      const res = await dispatch(
        forgotPasswordMail({ email: activeEmail })
      ).unwrap();
      toast.success(
        res?.message ||
          "Password reset OTP has been resent to your email."
      );
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    }
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-6">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#7900BA] drop-shadow-[0_4px_4px_#AFAFAF66]">
          Enter OTP
        </h1>
      </div>

      <div className="text-center mb-6">
        <p className="font-semibold text-sm text-gray-800">
          Your OTP was sent to your Email
        </p>
        {activeEmail && (
          <p className="text-xs text-purple-700 font-medium mt-1">{activeEmail}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-medium text-sm text-gray-700">Enter OTP</label>
          <input
            type="text"
            placeholder="••••••"
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
            autoFocus
            className="w-full mt-1 bg-[#F7F8F9] border border-gray-200 p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-base tracking-widest text-center font-bold"
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-xs text-[#7900BA] font-bold hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
            <Link to="/login" className="text-xs text-[#D3AB2A] font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading || !otp}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default EnterOtp;