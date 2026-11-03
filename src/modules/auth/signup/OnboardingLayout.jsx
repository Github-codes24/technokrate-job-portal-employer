import React from "react";
import StepProgressBar from "./companyDetails/StepProgressBar";
import bg from "../../../assets/auth/Vector.png";

/**
 * OnboardingLayout
 * Props:
 *  - illustration: string  — right-side foreground image
 *  - currentStep:  number  — 1-4 for progress bar (undefined = hide bar)
 *  - showBack:     bool    — show back arrow
 *  - onBack:       fn
 *  - children:     node    — form card
 */
const OnboardingLayout = ({ illustration, currentStep, showBack, onBack, children }) => {
  return (
    <div className="w-full h-screen overflow-hidden flex flex-col lg:flex-row bg-white font-poppins">

      {/* ── LEFT ── */}
      <div className="w-full lg:w-[50%] h-full flex flex-col justify-center items-center px-5 sm:px-8 py-6 relative overflow-y-auto">
        {showBack && (
          <button
            onClick={onBack}
            className="absolute top-5 left-5 text-gray-500 hover:text-[#7900BA] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
        )}

        {/* Card */}
        <div className="w-full max-w-[380px] bg-white border border-gray-200 shadow-[0_2px_12px_#58585830] rounded-xl px-8 py-8">
          {children}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="hidden lg:flex lg:w-[50%] h-full flex-col items-center justify-between relative overflow-hidden py-8">

        {/* Background image — absolute layer */}
        <img
          src={bg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Progress bar */}
        {currentStep && (
          <div className="relative z-10 w-full flex justify-center px-6 flex-shrink-0">
            <StepProgressBar currentStep={currentStep} />
          </div>
        )}

        {/* Illustration — constrained so it never overflows */}
        {illustration && (
          <div className="relative z-10 flex-1 flex items-center justify-center w-full px-6 min-h-0">
            <img
              src={illustration}
              alt="illustration"
              className="max-h-[65vh] w-auto max-w-[85%] object-contain drop-shadow-xl"
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default OnboardingLayout;