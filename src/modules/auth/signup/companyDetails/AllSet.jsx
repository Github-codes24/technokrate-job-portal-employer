import React from "react";
import { useNavigate } from "react-router-dom";
import StepProgressBar from "./StepProgressBar";
import Illustration from "../../../../assets/auth/signup/complete.svg";

const AllSet = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-12 px-6 pb-10 font-poppins"
      style={{ background: "linear-gradient(160deg, #f5e8ff 0%, #e9d5ff 40%, #f3e8ff 100%)" }}
    >
      {/* Progress bar — all complete */}
      <div className="mb-8">
        <StepProgressBar currentStep={5}/>
      </div>

      {/* Main card area */}
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">You're All Set</h1>
        <p className="text-2xl font-bold text-gray-900 mb-8">
          <span className="text-[#7900BA]">Welcome</span> to Technokrate Hire
        </p>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <img src={Illustration} alt="All Set" className="w-64 h-auto drop-shadow-lg"/>
        </div>

        <p className="text-sm text-gray-600 mb-1">you're almost set!</p>
        <p className="text-sm text-gray-600 mb-8">
          Start <span className="text-[#7900BA] font-semibold">posting jobs</span> and finding the right talent.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/profile")}
            className="px-8 py-3 border-2 border-[#7900BA] text-[#7900BA] font-semibold rounded-md hover:bg-purple-50 transition active:scale-95"
          >
            Go to My Profile
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-[#7900BA] hover:bg-[#65009e] text-white font-semibold rounded-md shadow-lg transition active:scale-95"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllSet;