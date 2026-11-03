import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Background   from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/Successful.svg";

const PasswordResetSuccess = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>

      <div className="flex flex-col items-center text-center py-4">
        {/* Purple checkmark badge */}
        <div className="w-16 h-16 rounded-full bg-[#7900BA] flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#7900BA] leading-tight mb-6 drop-shadow-[0_4px_4px_#AFAFAF66]">
          Reset<br/>Password
        </h1>

        <p className="text-sm font-semibold text-gray-700 mb-8">
          Password Reset Successfull
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition"
        >
          Sign In
        </button>
      </div>

    </AuthLayout>
  );
};

export default PasswordResetSuccess;