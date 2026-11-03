import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PaymentMethod = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upi");

  const savedPlan = sessionStorage.getItem("selectedPlan");
  const plan = savedPlan ? JSON.parse(savedPlan) : {};

  const originalTotal = Number(
    plan.originalTotal || plan.totalPrice || plan.price || 199
  );
  const discountedTotal = Number(
    plan.discountedTotal || plan.finalPrice || plan.discountedPrice || 149
  );
  const discountLabel = plan.discountLabel || "";
  const discountAmount = originalTotal - discountedTotal;

  return (
    <div className="min-h-screen bg-white rounded-[8px] border border-gray-300 shadow-xl p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ArrowLeft
          className="cursor-pointer text-gray-700"
          onClick={() => navigate(-1)}
        />
        <h2 className="text-lg font-semibold text-gray-800">
          Select Payment Method
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 border-b border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("upi")}
          className={`pb-3 text-base sm:text-xl font-bold transition-all ${
            activeTab === "upi"
              ? "text-purple-700 border-b-4 border-purple-700"
              : "text-gray-800"
          }`}
        >
          Scan & Pay via UPI
        </button>

        <button
          onClick={() => setActiveTab("card")}
          className={`pb-3 text-base sm:text-xl font-bold transition-all ${
            activeTab === "card"
              ? "text-purple-700 border-b-4 border-purple-700"
              : "text-gray-800"
          }`}
        >
          Credit Card/Debit Card
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-5 lg:p-8 min-h-[520px] flex flex-col justify-between">
            {activeTab === "upi" ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="w-44 h-44 bg-gray-100 rounded-xl mb-8 flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Payment"
                    alt="QR Code"
                    className="opacity-30 blur-[1px]"
                  />
                </div>

                <p className="text-purple-700 font-semibold text-lg mb-8 text-center">
                  A QR Code will be generated to make the payment
                </p>

                <button className="w-full max-w-sm bg-purple-700 text-white py-3 rounded-md font-bold text-base hover:bg-purple-800 transition">
                  Generate QR Code
                </button>
              </div>
            ) : (
              <div className="w-full max-w-xl mx-auto space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card holder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Your name on the card"
                    className="w-full border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select className="border border-gray-300 rounded-md p-3 bg-gray-50 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-700">
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, "0");
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        );
                      })}
                    </select>

                    <select className="border border-gray-300 rounded-md p-3 bg-gray-50 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-700">
                      <option value="">Year</option>
                      {Array.from({ length: 25 }, (_, i) => {
                        const year = 2020 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter CVV
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      placeholder="Enter CVV"
                      className="flex-1 border border-gray-300 rounded-md p-3 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                    <div className="w-40 border border-gray-300 rounded-md p-2 flex items-center">
                      <span className="text-[10px] text-gray-400 leading-tight">
                        3 Digits Printed on the back of the card
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="text-[11px] text-gray-500 text-center leading-relaxed mb-5">
                Technohire does not store any account related information or any
                credit / debit card details. You'll be redirected to a
                third-party gateway for payment.
              </p>

              <div className="flex justify-center items-center gap-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-purple-700"
                  id="terms"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white border rounded-xl p-5 shadow-sm sticky top-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Total Amount</span>
              <span>₹{originalTotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm mb-3 text-gray-500">
                <span>Discount {discountLabel ? `(${discountLabel})` : ""}</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <hr className="mb-3" />

            <div className="flex justify-between font-semibold mb-4">
              <span>Total Payable Amount</span>
              <span className="text-green-600">₹{discountedTotal}</span>
            </div>

            <button
              onClick={() =>
                navigate("/plan/payment-status")
              }
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-md font-medium"
            >
              {activeTab === "upi" ? "Continue" : "Proceed to pay"}
            </button>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Renew automatically every month until cancelled the autopay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;