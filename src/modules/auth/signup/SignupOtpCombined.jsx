import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Check, Phone } from "lucide-react";

import {
  verifyMobileOtp,
} from "../../../redux/slices/auth/Signupslice";

import AuthLayout from "../login/AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/signup/verification.svg";

const OTP_LENGTH = 6;

const OtpInput = ({ otp, setOtp, inputRefs }) => {
  const handleChange = (e, idx) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");
      digits.forEach((d, i) => { next[i] = d });
      setOtp(next);
      const focusIdx = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otp];
    next[idx] = value;
    setOtp(next);

    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleFocus = (e) => e.target.select();

  return (
    <div className="flex justify-center gap-2 mb-4">
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={handleFocus}
          className={`w-11 h-11 text-center text-base font-bold border-2 rounded-xl
            outline-none transition-all duration-150 select-none
            ${digit
              ? 'border-[#7c3aed] bg-purple-50 text-[#7c3aed]'
              : 'border-gray-200 bg-[#F7F8F9] text-gray-800'
            }
            focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100`}
        />
      ))}
    </div>
  );
};

const SignupOtpCombined = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { mobileVerified, loading } = useSelector((state) => state.signup);

  const mobileNumber = location.state?.mobileNumber || "";
  const devOtp = location.state?.otp || "";

  const [mobileOtp, setMobileOtp] = useState(Array(OTP_LENGTH).fill(""));
  const mobileInputRefs = useRef([]);

  useEffect(() => {
    if (!mobileNumber) {
      toast.error("Please complete signup first");
      navigate("/signup");
    }
  }, [mobileNumber, navigate]);

  const handleVerifyMobile = async () => {
    const otp = mobileOtp.join("");
    if (otp.length < OTP_LENGTH) {
      return toast.error(`Enter all ${OTP_LENGTH} digits`);
    }
    try {
      await dispatch(verifyMobileOtp({ mobileNumber, clientOTP: otp })).unwrap();
      toast.success("Mobile number verified successfully!");
    } catch (err) {
      toast.error(err || "Mobile OTP verification failed");
    }
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Account</h1>
        <p className="text-sm text-gray-500">Enter the OTP sent to your registered mobile number</p>
      </div>

      <div className={`border rounded-2xl p-5 shadow-sm mb-6 transition-colors
        ${mobileVerified ? 'border-green-100 bg-green-50/30' : 'bg-white border-gray-100'}`}>
        
        {devOtp && !mobileVerified && (
          <div
            className="mb-4 rounded-xl px-4 py-2 text-sm text-center text-purple-700 font-semibold"
            style={{ background: "rgba(121,0,186,.07)", border: "1px solid rgba(121,0,186,.2)" }}
          >
            Dev OTP: {devOtp}
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${mobileVerified ? 'bg-green-100 text-green-600' : 'bg-purple-50 text-[#7c3aed]'}`}>
            <Phone className="w-4 h-4"/>
          </div>
          <span className="text-sm font-semibold text-gray-700">{mobileNumber || 'Mobile Number'}</span>
        </div>

        {mobileVerified ? (
          <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-semibold">
            <Check className="w-5 h-5" strokeWidth={2.5}/> Verified
          </div>
        ) : (
          <>
            <OtpInput otp={mobileOtp} setOtp={setMobileOtp} inputRefs={mobileInputRefs}/>

            <button onClick={handleVerifyMobile} disabled={loading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>

      <button
        disabled={!mobileVerified}
        onClick={() => navigate("/onboarding/company-details")}
        className={`w-full py-3 rounded-xl font-bold transition
          ${mobileVerified
            ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white cursor-pointer active:scale-[0.98]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
      >
        Continue to Onboarding
      </button>

      <p className="text-xs text-center mt-4 text-gray-400">
        Entered wrong details?{" "}
        <Link to="/signup" className="text-[#7c3aed] font-bold hover:underline">Go Back</Link>
      </p>
    </AuthLayout>
  );
};

export default SignupOtpCombined;
