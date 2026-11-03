import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  console.log("LOCATION STATE =>", state);
  console.log("CHECKOUT PLAN =>", state?.plan);

const plan = state?.plan || {};

const planName = plan.durationLabel || "Plan";
const tag = plan.planTag || "Selected Plan";

const originalTotal = Number(
  plan.originalTotal || plan.totalPrice || plan.price || 0
);

const discountedTotal = Number(
  plan.discountedTotal || plan.finalPrice || plan.discountedPrice || 0
);

const discount = plan.discountLabel || "";

const discountAmount = originalTotal - discountedTotal;

  return (
    <div className="border border-gray-300 rounded-[8px] shadow-xl p-4 lg:p-4 lg:h-full bg-white">
      <div className="flex items-center gap-2 mb-5">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() => navigate("/plan/subscription")}
        />
        <h2 className="text-lg font-semibold">Checkout</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="bg-white border rounded-xl p-6">
            <p className="text-purple-600 font-semibold">{planName}</p>
            <p className="font-semibold text-lg">{tag}</p>
            <p className="text-gray-400 text-sm mb-4">Selected Plan</p>

            <hr className="my-4" />

            <div className="flex items-center gap-3">
              <span className="line-through text-gray-400">₹{originalTotal}</span>
              <span className="font-semibold text-lg">₹{discountedTotal}</span>

              {discount && (
                <span className="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full">
                  {discount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Total Amount</span>
              <span>₹{originalTotal}</span>
            </div>

            <div className="flex justify-between text-sm mb-3 text-gray-500">
              <span>Discount</span>
              <span>-₹{discountAmount}</span>
            </div>

            <hr className="mb-3" />

            <div className="flex justify-between font-semibold mb-4">
              <span>Total Payable Amount</span>
              <span className="text-green-600">₹{discountedTotal}</span>
            </div>

            <button
              onClick={() =>{ 
                sessionStorage.setItem("selectedPlan", JSON.stringify(plan));
                navigate("/plan/payment")}}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-md font-medium"
            >
              Continue
            </button>

            <p className="text-xs text-gray-400 mt-3">
              Renew automatically every month until cancelled the autopay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;