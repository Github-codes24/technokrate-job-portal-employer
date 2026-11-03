import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const PaymentStatus = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("selectedPlan");
    const plan = savedPlan ? JSON.parse(savedPlan) : {};

    if (!plan?._id) return;

    const paymentKey = `creditsAdded_${plan._id}`;

    if (sessionStorage.getItem(paymentKey)) return;

    const oldJobCredits = Number(localStorage.getItem("jobCredits") || 0);
    const oldDatabaseCredits = Number(localStorage.getItem("databaseCredits") || 0);

    const newJobCredits = oldJobCredits + Number(plan.jobCredits || 0);
    const newDatabaseCredits =
      oldDatabaseCredits + Number(plan.databaseCredits || 0);

    localStorage.setItem("jobCredits", newJobCredits);
    localStorage.setItem("databaseCredits", newDatabaseCredits);
    // Temporary frontend state until the subscription-status API is available.
    // The backend should later return this as part of the employer profile.
    localStorage.setItem("activeSubscription", JSON.stringify({
      id: plan._id,
      name: plan.durationLabel || plan.planTag || "Subscription Plan",
      activatedAt: new Date().toISOString(),
    }));

    sessionStorage.setItem(paymentKey, "true");


    const oldNotifications = JSON.parse(
      localStorage.getItem("employerNotifications") || "[]"
    );

    const newNotification = {
      id: Date.now(),
      title: "Payment Successful",
      desc: `Payment completed successfully. ${plan.jobCredits || 0} Job Credits and ${plan.databaseCredits || 0} Database Credits added.`,
      time: new Date().toLocaleString(),
      type: "success",
      read: false,
    };

    localStorage.setItem(
      "employerNotifications",
      JSON.stringify([newNotification, ...oldNotifications])
    );

    window.dispatchEvent(new Event("notificationUpdated"));

    window.dispatchEvent(new Event("creditsUpdated"));
    window.dispatchEvent(new Event("subscriptionPolicyUpdated"));
  }, []);

  return (
    <div className="min-h-[calc(100vh-40px)] bg-white rounded-[8px] flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#7E00B4] text-white shadow-md">
        <Check size={38} strokeWidth={4} />
      </div>

      <div className="text-center mb-14">
        <h1 className="text-[42px] md:text-[48px] font-bold text-[#7E00B4] leading-tight mb-6">
          Payment <br /> Successful
        </h1>

        <p className="text-[16px] md:text-[18px] font-medium text-gray-800">
          Your payment has been processed successfully.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full max-w-[460px] bg-[#7E00B4] text-white py-4 rounded-[8px] font-semibold text-[16px] shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          Back to Dashboard
        </button>

        <button
          onClick={() => navigate("/plan/invoice")}
          className="px-5 py-2 rounded-[4px] border border-[#7E00B4] font-semibold text-[#7E00B4] text-[12px] hover:bg-purple-50 transition-all"
        >
          View Invoice
        </button>
      </div>
    </div>
  );
};

export default PaymentStatus;
