import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPasswordMail, setResetEmail, clearError } from "../../../redux/slices/auth/SigninSlice";
import AuthLayout from "./AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/ForgotPassword.svg";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    toast.error("Invalid Email Format");
      return;
    }

    try {
      const res = await dispatch(forgotPasswordMail({ email: trimmedEmail })).unwrap();
      dispatch(setResetEmail(trimmedEmail));
      toast.success(
        res?.message ||
          "Password reset OTP has been sent to your email and will expire in 15 minutes"
      );
      navigate("/otp");
    } catch (err) {
      toast.error(err || "Failed to send reset email");
    }
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-6">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#7900BA] leading-tight drop-shadow-[0_4px_4px_#AFAFAF66]">
          Forgot<br />Password
        </h1>
        <p className="text-base text-[#18191C] mt-2">Employer Dashboard</p>
      </div>

      <div className="text-center mb-6">
        <p className="font-semibold text-sm text-gray-800">Please enter your email address</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="font-medium text-sm text-gray-700">Enter E-mail</label>
          <input
            type="email"
            placeholder="employer@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 bg-[#F7F8F9] border border-gray-200 p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm"
          />
          <div className="text-right mt-1">
            <Link to="/login" className="text-[11px] text-[#D3AB2A] font-bold hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgetPassword;