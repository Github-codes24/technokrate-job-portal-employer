export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    badge: "🥉",
    price: 2500,
    description: "For growing teams that are ready to start posting jobs.",
  },
  {
    id: "advance",
    name: "Advance Plan",
    badge: "🥈",
    price: 5000,
    description: "More flexibility for companies with regular hiring needs.",
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium Plan",
    badge: "🥇",
    price: 5500,
    description: "Best for teams managing ongoing recruitment.",
  },
];

export const FREE_PROFILE_UNLOCKS = 3;

export const getCompanyClassification = () =>
  // This value will be supplied by the admin/company-status API. Until then,
  // employer actions stay locked instead of assuming a company type.
  localStorage.getItem("adminCompanyClassification") || "pending";

// The employer profile is the source of truth for the company type assigned by
// the admin. API responses have used both `companyType` and the nested
// `businessDetail.typeOfCompany` field, so support both shapes here.
export const syncCompanyClassification = (companyProfile) => {
  const profile = companyProfile?.user ?? companyProfile;
  const companyType = String(
    profile?.companyType ?? profile?.businessDetail?.typeOfCompany ?? ""
  )
    .trim()
    .toLowerCase();

  if (companyType === "internal" || companyType === "external") {
    setCompanyClassification(companyType);
  }
};

export const setCompanyClassification = (classification) => {
  localStorage.setItem("adminCompanyClassification", classification);
  window.dispatchEvent(new Event("subscriptionPolicyUpdated"));
};

export const getActiveSubscription = () => {
  try {
    return JSON.parse(localStorage.getItem("activeSubscription") || "null");
  } catch {
    return null;
  }
};

export const hasJobPostingAccess = () =>
  getCompanyClassification() === "internal" ||
  (getCompanyClassification() === "external" && Boolean(getActiveSubscription()));

export const getFreeUnlocksRemaining = () => {
  const saved = localStorage.getItem("freeProfileUnlocksRemaining");
  return saved === null ? FREE_PROFILE_UNLOCKS : Math.max(Number(saved), 0);
};
