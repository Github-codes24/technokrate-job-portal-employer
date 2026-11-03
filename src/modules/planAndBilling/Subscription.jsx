import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlanTypes, fetchAllPlans } from "../../redux/slices/plans/planSlice";
import { fetchRemainingCredits } from "../../redux/slices/candidateUnlock/creditDeductionSlice";
import ContactCustomPlanForm from "./ContactCustomPlanForm";
import BuyCreditsModal from "../../components/common/BuyCreditsModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_PLANS } from "../../utils/subscriptionPolicy";
import ResponsiveLogo from "../../assets/favicon.png";
import logo from "../../assets/Logo.svg";

/** --- Database Credit Packages (APIs 7A & 7B) --- **/
const DATABASE_PACKAGES = [
  {
    id: "basic",
    name: "Basic Package",
    tagline: "For quick individual hiring",
    credits: 10,
    price: 1000,
    pricePerCredit: 100,
    recommended: false,
    features: [
      "10 Database Credits",
      "Unlock 10 Full Candidate Profiles",
      "Export 5 Candidates to Excel",
      "Instant Activation",
      "Credits Never Expire",
    ],
  },
  {
    id: "standard",
    name: "Standard Package",
    tagline: "Most popular for active hiring",
    credits: 50,
    price: 4500,
    pricePerCredit: 90,
    recommended: true,
    discountLabel: "10% OFF",
    features: [
      "50 Database Credits",
      "Unlock 50 Full Candidate Profiles",
      "Export 25 Candidates to Excel",
      "Instant Activation",
      "Credits Never Expire",
      "Priority Candidate Search Support",
    ],
  },
  {
    id: "premium",
    name: "Premium Package",
    tagline: "Best value for agencies & teams",
    credits: 100,
    price: 8000,
    pricePerCredit: 80,
    recommended: false,
    discountLabel: "20% OFF",
    features: [
      "100 Database Credits",
      "Unlock 100 Full Candidate Profiles",
      "Export 50 Candidates to Excel",
      "Instant Activation",
      "Credits Never Expire",
      "Priority Candidate Search Support",
      "Dedicated Relationship Assistance",
    ],
  },
];

/** --- Icons --- **/
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.25" stroke="#7c3aed" strokeWidth="1.5" />
    <path d="M5 8.5l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CustomCheckIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="rgba(255,255,255,0.1)" />
    <path d="M5 8.5l2 2 4-4" stroke="#c4b8ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** --- Skeleton Component --- **/
const PlanSkeleton = () => (
  <div className="flex flex-col bg-gray-50 rounded-2xl border border-gray-100 p-5 h-[450px] animate-pulse">
    <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-32 bg-gray-200 rounded mb-6" />
    <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <div className="h-8 w-20 bg-gray-200 rounded mb-3" />
      <div className="h-4 w-full bg-gray-200 rounded" />
    </div>
    <div className="h-10 w-full bg-gray-200 rounded-xl mb-6" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-3 w-full bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);

const jobPostingPlans = SUBSCRIPTION_PLANS.map((plan) => ({
  _id: plan.id,
  durationLabel: plan.name,
  planTag: "Job Posting Plan",
  discountedPricePerMonth: plan.price,
  originalTotal: plan.price,
  discountedTotal: plan.price,
  duration: 30,
  features: ["Job posting access", "AI matching algorithm"],
  recommended: plan.recommended,
}));

export default function TechnokrateSubscription() {
  const dispatch = useDispatch();
  const { plans, loading, activePayment } = useSelector((state) => state.plans);
  const { remainingCredits } = useSelector((state) => state.creditDeduction);

  const [activeTab, setActiveTab] = useState("Job_Posting");
  const [processingId, setProcessingId] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState("standard");
  const navigate = useNavigate();

  const visiblePlanTypes = [
    { value: "Job_Posting", label: "Job Posting Plans" },
    { value: "Database_Credits", label: "Database Credits" },
  ];

  const isJobPostingTab = activeTab === "Job_Posting";
  const isDatabaseCreditsTab = activeTab === "Database_Credits";
  const visiblePlans = plans && plans.length > 0 ? plans : jobPostingPlans;

  useEffect(() => {
    dispatch(fetchRemainingCredits());
  }, [dispatch]);

  // Fetch plans when tab changes
  useEffect(() => {
    if (activeTab === "Job_Posting") {
      dispatch(fetchAllPlans({ planType: activeTab }));
    }
  }, [dispatch, activeTab]);

  // Handle Payment Redirection
  useEffect(() => {
    const link = activePayment?.paymentLink || activePayment?.short_url || activePayment?.url || activePayment?.shorturl;
    if (link) {
      window.location.href = link;
    }
  }, [activePayment]);

  const handleBuyNow = (plan) => {
    navigate("/plan/checkout", {
      state: { plan },
    });
  };



  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-4 font-sans rounded-xl">
      <style>{`
        .font-sora { font-family: 'Sora', sans-serif !important; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up   { animation: fadeUp 0.38s ease both; }
        .delay-1  { animation-delay: 0.06s; }
        .delay-2  { animation-delay: 0.12s; }
      `}</style>

      <div className="max-w-9xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <span className="font-sora inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3 bg-violet-100 text-violet-700">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
            Smart Recruitment Platform
          </span>
          <div className="flex items-center justify-center">
            <img
              src={logo}
              alt="Technokrate Hire"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* <h1 className="font-sora text-4xl font-extrabold text-violet-950 tracking-tight leading-tight m-0">
            Technokrate <span className="text-violet-600">Hire</span>
          </h1> */}
        </div>

        {/* Deal Banner */}
        <div className="animate-fade-up delay-1 rounded-2xl overflow-hidden relative flex items-center justify-center mb-8 bg-gradient-to-r from-violet-800 via-purple-600 to-pink-500 px-6 py-5">
          <div className="font-sora absolute inset-0 flex items-center justify-around pointer-events-none opacity-5 text-[96px] font-black tracking-[-6px]">
            <span>53%</span><span>53%</span>
          </div>
          <div className="relative text-center">
            <p className="font-sora font-black text-xl tracking-widest text-yellow-300 uppercase">
              🔥 Limited-Time Deal
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-up delay-2 flex gap-1.5 bg-violet-100 rounded-2xl p-1.5 mb-8">
          {visiblePlanTypes.map((t) => {
            const active = activeTab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`font-sora flex-1 flex flex-col items-center py-2.5 px-2 rounded-xl transition-all duration-200 border-none cursor-pointer
                  ${active ? "bg-violet-700 text-white shadow-lg" : "bg-transparent text-violet-700 hover:bg-violet-200/50"}`}
              >
                <span className={`font-bold text-xs ${active ? "text-white" : "text-violet-800"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Database Credits Current Balance Callout */}
        {isDatabaseCreditsTab && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200/60 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Database Balance</p>
                <p className="text-xl font-black text-purple-900">{remainingCredits} Credits Available</p>
              </div>
            </div>
            <button
              onClick={() => setIsBuyCreditsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-purple-200 transition active:scale-95"
            >
              Recharge Now
            </button>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {isDatabaseCreditsTab ? (
            DATABASE_PACKAGES.map((pkg, i) => (
              <div
                key={pkg.id}
                className={`animate-fade-up flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2
                  ${pkg.recommended ? "ring-2 ring-violet-500 shadow-2xl" : "border border-violet-100 shadow-sm"}`}
              >
                {pkg.recommended ? (
                  <div className="bg-gradient-to-r from-violet-700 to-purple-500 text-white text-[10px] font-bold text-center py-1.5 tracking-wider font-sora">
                    ★ Most Popular Choice
                  </div>
                ) : <div className="h-1 bg-violet-50" />}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-sora font-extrabold text-lg text-violet-950">{pkg.name}</p>
                    {pkg.discountLabel && (
                      <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-sora">
                        {pkg.discountLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-violet-400 mt-0.5 mb-4">{pkg.tagline}</p>

                  <div className="bg-violet-50 rounded-xl p-3.5 mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-sora font-extrabold text-2xl text-violet-950">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-violet-400">one-time</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-xs font-sora text-violet-900 font-semibold">Total Credits</span>
                      <span className="font-sora text-sm font-extrabold text-violet-700">{pkg.credits} Credits</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCreditPackage(pkg.id);
                      setIsBuyCreditsModalOpen(true);
                    }}
                    className={`font-sora w-full py-2.5 rounded-xl border-none font-bold text-sm text-white cursor-pointer mb-4 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2
                      ${pkg.recommended ? "bg-gradient-to-r from-violet-700 to-purple-500 shadow-md" : "bg-violet-700 hover:bg-violet-800"}`}
                  >
                    Buy {pkg.credits} Credits
                  </button>

                  <ul className="flex flex-col gap-1 list-none p-0 m-0">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                        <CheckIcon /> <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : loading && !isJobPostingTab ? (
            <>
              <PlanSkeleton />
              <PlanSkeleton />
              <PlanSkeleton />
            </>
          ) : (
            visiblePlans.map((p, i) => {
              const isProcessing = processingId === p._id;
              return (
                <div
                  key={p._id}
                  className={`animate-fade-up flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2
            ${i === 1 ? "ring-2 ring-violet-500 shadow-2xl" : "border border-violet-100 shadow-sm"}`}
                >
                  {p.recommended || i === 1 ? (
                    <div className="bg-gradient-to-r from-violet-700 to-purple-500 text-white text-[10px] font-bold text-center py-1.5 tracking-wider font-sora">
                      + Recommended for you
                    </div>
                  ) : <div className="h-1 bg-violet-50" />}

                  <div className="p-5 flex flex-col flex-1">
                    <p className="font-sora font-extrabold text-lg text-violet-950">{p.durationLabel}</p>
                    <p className="text-[11px] text-violet-300 mt-0.5 mb-4">{p.planTag}</p>

                    <div className="bg-violet-50 rounded-xl p-3.5 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-sora font-extrabold text-2xl text-violet-950">₹{p.discountedPricePerMonth}</span>
                        <span className="text-xs text-violet-400">/month</span>
                      </div>

                      {/* FIXED ALIGNMENT ROW */}
                      <div className=" relative flex items-center justify-between gap-2 mt-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-sora text-violet-900 font-semibold whitespace-nowrap">Total Price</span>
                          <span className="text-[11px] text-violet-300 line-through">₹{p.originalTotal}</span>
                          <span className="font-sora text-xs font-bold text-violet-800">₹{p.discountedTotal}</span>
                        </div>

                        {p.discountLabel && (
                          <span className="absolute -top-10 -right-1 bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-sora whitespace-nowrap shrink-0">
                            {p.discountLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyNow(p)}
                      disabled={processingId !== null}
                      className={`font-sora w-full py-2.5 rounded-xl border-none font-bold text-sm text-white cursor-pointer mb-4 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2
                ${i === 1 ? "bg-gradient-to-r from-violet-700 to-purple-500 shadow-md" : "bg-violet-700 hover:bg-violet-800"}
                ${isProcessing ? "opacity-90" : ""} ${processingId !== null && !isProcessing ? "grayscale pointer-events-none opacity-50" : ""}`}
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : "Purchase Now"}
                    </button>

                    <ul className="flex flex-col gap-1 list-none p-0 m-0">
                      {p.jobCredits > 0 && (
                        <li className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                          <CheckIcon /> <span>{p.jobCredits} Job credits</span>
                        </li>
                      )}
                      {p.databaseCredits > 0 && (
                        <li className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                          <CheckIcon /> <span>{p.databaseCredits} Database credits</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                        <CheckIcon /> <span>Use Credits in {p.duration} days</span>
                      </li>
                      <li className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                        <CheckIcon /> <span>AI matching algorithm</span>
                      </li>
                      {p.features?.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-[11.5px] text-violet-600 px-1.5 py-1 rounded-lg hover:bg-violet-50">
                          <CheckIcon /> <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-center text-[10.5px] text-violet-300 mt-4">
          * All plan prices are shown excluding applicable taxes.
        </p>
      </div>

      <ContactCustomPlanForm
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsModalOpen}
        onClose={() => setIsBuyCreditsModalOpen(false)}
        initialPackage={selectedCreditPackage}
      />
    </div>
  );
}
