import React from "react";
import Logo from "../../../assets/Logo.svg";

/**
 * AuthLayout
 * ──────────────────────────────────────────────
 * Props:
 *  - illustration: string  — path to right-side image
 *  - bgImage:      string  — path to background vector (optional)
 *  - children:     node    — the form card content
 *
 * Responsive behaviour:
 *  - Mobile / Tablet (< lg): single column, logo + card stacked
 *  - Desktop (≥ lg): two-column split — form left, illustration right
 */
const AuthLayout = ({ illustration, bgImage, children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white font-poppins">

      {/* ── LEFT: Logo + Form card ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center
                      px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20
                      py-8 sm:py-10 lg:py-4
                      min-h-screen lg:min-h-auto">

        {/* Logo — scales with screen, never overflows */}
        <div className="w-full max-w-[420px] flex justify-center mb-2">
          <img
            src={Logo}
            alt="Technokrate Hire"
            className="w-auto max-w-[200px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-[380px] h-auto object-contain"
          />
        </div>

        {/* Card — full width on xs, capped on larger screens */}
        <div className="w-full max-w-[480px] bg-white border border-gray-200
                        shadow-[0_2px_16px_rgba(88,88,88,0.12)]
                        rounded-2xl
                        px-5 sm:px-8 md:px-10
                        py-6 sm:py-8">
          {children}
        </div>

      </div>

      {/* ── RIGHT: Background + Illustration (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen
                   items-center justify-center overflow-hidden flex-shrink-0"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "75%",
          backgroundPosition: "right top",
          backgroundRepeat: "no-repeat",
        }}
      >
        {!bgImage && (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #c084fc 0%, #9333ea 50%, #7e22ce 100%)",
              borderRadius: "0 0 0 80px",
            }}
          />
        )}

        {illustration && (
          <div className="relative z-10 w-full h-full flex justify-end items-end p-10">
            <img
              src={illustration}
              alt="illustration"
              className="w-[88%] max-w-[600px] h-auto drop-shadow-2xl"
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default AuthLayout;