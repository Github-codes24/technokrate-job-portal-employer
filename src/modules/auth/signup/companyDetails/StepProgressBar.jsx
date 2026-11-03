import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Company Details",           path: "/onboarding/company-details"    },
  { label: "Business Details",          path: "/onboarding/business-details"   },
  { label: "Hiring Preferences",        path: "/onboarding/hiring-preferences" },
  { label: "Verification",              path: "/onboarding/verification"       },
];

const StepProgressBar = ({ currentStep }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const stepNum     = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive    = stepNum === currentStep;
        const isClickable = isCompleted; // only allow going back to completed steps

        return (
          <React.Fragment key={idx}>
            {/* Step item */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Circle */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && navigate(step.path)}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 outline-none
                  ${isCompleted
                    ? "bg-[#7900BA] border-[#7900BA] cursor-pointer hover:bg-[#65009e] hover:border-[#65009e] hover:scale-105 active:scale-95"
                    : isActive
                    ? "bg-[#7900BA] border-[#7900BA] cursor-default ring-4 ring-[#7900BA]/20"
                    : "bg-white border-gray-200 cursor-default"
                  }
                `}
                title={isClickable ? `Go to ${step.label}` : undefined}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                )}
              </button>

              {/* Label */}
              <span
                className={`
                  text-[11px] text-center mt-2 leading-tight max-w-[72px] transition-colors duration-200
                  ${isActive    ? "font-semibold text-[#7900BA]"  : ""}
                  ${isCompleted ? "font-medium text-[#7900BA]/70 " : ""}
                  ${!isActive && !isCompleted ? "text-white font-normal" : ""}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5 h-[2px] rounded-full overflow-hidden bg-gray-200">
                <div
                  className="h-full bg-[#7900BA] rounded-full transition-all duration-500"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepProgressBar;