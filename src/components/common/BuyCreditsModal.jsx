import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  X, CheckCircle2, Sparkles, Shield,
  CreditCard, Loader2, Zap, ArrowRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createCreditOrder,
  verifyCreditPayment,
  fetchRemainingCredits
} from '../../redux/slices/candidateUnlock/creditDeductionSlice';

const CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    credits: 10,
    price: 1000,
    pricePerCredit: 100,
    tagline: 'Ideal for occasional hires',
    popular: false,
    gradient: 'from-gray-50 to-purple-50',
    borderColor: 'border-purple-200',
    badge: null,
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 50,
    price: 4500,
    pricePerCredit: 90,
    tagline: 'Most popular for active recruitment',
    popular: true,
    gradient: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-500 ring-2 ring-purple-500/20',
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 100,
    price: 8000,
    pricePerCredit: 80,
    tagline: 'Best value for high-volume hiring',
    popular: false,
    gradient: 'from-indigo-50 to-pink-50',
    borderColor: 'border-pink-300',
    badge: 'Best Value (20% Off)',
  },
];

const BuyCreditsModal = ({ isOpen, onClose, initialPackage = 'standard' }) => {
  const dispatch = useDispatch();
  const { remainingCredits, orderLoading, verifyLoading } = useSelector(
    (s) => s.creditDeduction
  );
  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (initialPackage) {
      setSelectedPackage(initialPackage);
    }
  }, [initialPackage, isOpen]);

  if (!isOpen) return null;

  const currentPkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage) || CREDIT_PACKAGES[1];

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create Order via API 7A
      const orderRes = await dispatch(createCreditOrder(currentPkg.id)).unwrap();
      const orderData = orderRes?.data;

      if (!orderData) {
        throw new Error(orderRes?.message || 'Failed to create order');
      }

      // Check if it's Mock Mode as configured by backend
      const isMock =
        orderData.key === 'rzp_test_mock_key' ||
        (orderData.orderId && orderData.orderId.startsWith('order_mock_')) ||
        !window.Razorpay;

      if (isMock) {
        // Step 2 in Mock Mode: Verify Payment directly via API 7B
        const verifyRes = await dispatch(
          verifyCreditPayment({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: `sig_mock_${Date.now()}`,
            packageId: currentPkg.id,
          })
        ).unwrap();

        const added = verifyRes.data?.addedCredits || currentPkg.credits;
        const newBalance = verifyRes.data?.credits ?? (remainingCredits + added);

        toast.success(`🎉 Payment verified! Added ${added} credits. New balance: ${newBalance}`);
        dispatch(fetchRemainingCredits());
        onClose();
        return;
      }

      // Real Razorpay Mode
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Technokrate Hire',
        description: `Purchase ${currentPkg.credits} Database Credits`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await dispatch(
              verifyCreditPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageId: currentPkg.id,
              })
            ).unwrap();

            const added = verifyRes.data?.addedCredits || currentPkg.credits;
            toast.success(`🎉 Payment successful! Added ${added} credits.`);
            dispatch(fetchRemainingCredits());
            onClose();
          } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Payment verification failed');
          }
        },
        theme: {
          color: '#7c3aed',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err.message || 'Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = isProcessing || orderLoading || verifyLoading;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto">
        {/* Header Banner */}
        <div
          className="relative px-6 py-5 text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 40%, #9333EA 70%, #DB2777 100%)',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-purple-200 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Instant Recharge
          </div>
          <h2 className="text-xl font-extrabold text-white">Buy Database Credits</h2>
          <p className="text-xs text-purple-100/90 mt-0.5">
            Unlock profiles & export candidates with instant credit recharge
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold">
            <span>Current Balance:</span>
            <span className="font-extrabold text-yellow-300 text-sm">{remainingCredits}</span>
            <span>Credits</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Package Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => !loading && setSelectedPackage(pkg.id)}
                  className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between
                    ${isSelected
                      ? 'border-purple-600 bg-purple-50/40 shadow-md shadow-purple-100'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                      {pkg.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {pkg.name}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                          ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-2xl font-black text-gray-900">{pkg.credits}</span>
                      <span className="text-xs font-bold text-purple-600 ml-1">Credits</span>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-tight mb-3">
                      {pkg.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-purple-700">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">₹{pkg.pricePerCredit}/cr</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Credit Usage Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Zap className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>1 Profile Unlock = <strong>1 Credit</strong></span>
              <span className="text-gray-300">|</span>
              <span>1 Excel Export = <strong>2 Credits</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5" /> Credits Never Expire
            </div>
          </div>

          {/* Order Summary & Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Total Payable Amount</p>
              <p className="text-2xl font-black text-gray-900">
                ₹{currentPkg.price.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-gray-500">
                  (+ {currentPkg.credits} Credits)
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay ₹{currentPkg.price.toLocaleString('en-IN')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BuyCreditsModal;
