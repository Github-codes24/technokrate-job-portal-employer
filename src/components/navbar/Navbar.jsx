import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  CreditCard,
  Loader2,
  ChevronDown,
  Briefcase,
  Database,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreditStats } from "../../redux/slices/creditTransaction/creditAndTransactionSlice";
import { fetchRemainingCredits } from "../../redux/slices/candidateUnlock/creditDeductionSlice";
import { fetchNotifications, fetchUnreadCount } from "../../redux/slices/notification/notificationSlice";
import BuyCreditsModal from "../common/BuyCreditsModal";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [localCredits, setLocalCredits] = useState({
    jobCredits: Number(localStorage.getItem("jobCredits") || 0),
    databaseCredits: Number(localStorage.getItem("databaseCredits") || 0),
  });

  const { stats, loading } = useSelector((state) => state.creditAndTransaction);
  const { unreadCount: apiUnreadCount } = useSelector((state) => state.notification || {});

  const refreshLocalCredits = () => {
    setLocalCredits({
      jobCredits: Number(localStorage.getItem("jobCredits") || 0),
      databaseCredits: Number(localStorage.getItem("databaseCredits") || 0),
    });
  };

  const [localNotifications, setLocalNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem("employerNotifications") || "[]");
  });

  const refreshNotifications = () => {
    setLocalNotifications(
      JSON.parse(localStorage.getItem("employerNotifications") || "[]")
    );
    dispatch(fetchUnreadCount());
  };

  useEffect(() => {
    dispatch(fetchCreditStats());
    dispatch(fetchRemainingCredits());
    dispatch(fetchUnreadCount());

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCreditOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("creditsUpdated", refreshLocalCredits);
    window.addEventListener("storage", refreshLocalCredits);
    window.addEventListener("notificationUpdated", refreshNotifications);

    refreshLocalCredits();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("creditsUpdated", refreshLocalCredits);
      window.removeEventListener("storage", refreshLocalCredits);
      window.removeEventListener("notificationUpdated", refreshNotifications);
    };
  }, [dispatch]);

  const jobCredits = localCredits.jobCredits || stats?.jobCredits || 0;
  const databaseCredits =
    localCredits.databaseCredits || stats?.databaseCredits || 0;

  const totalCredits = jobCredits + databaseCredits;

  const localUnreadCount = localNotifications.filter((n) => !n.read).length;
  const unreadCount = apiUnreadCount !== undefined && apiUnreadCount !== null ? apiUnreadCount : localUnreadCount;

  const handleNotificationClick = () => {
    const updated = localNotifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem("employerNotifications", JSON.stringify(updated));
    setLocalNotifications(updated);
    navigate("/notification");
  };

  return (
    <header className="w-full bg-white border-b border-purple-400 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuClick}
          type="button"
          aria-label="Open Menu"
          className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-[#8931BA] hover:bg-purple-50 transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#8931BA] truncate">
          Employer Panel
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCreditOpen(!isCreditOpen)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-sm transition-all duration-300 border ${isCreditOpen
              ? "bg-[#8931BA] text-white border-[#8931BA] shadow-md"
              : "bg-[#8931BA]/5 text-gray-600 border-[#8931BA]/10 hover:bg-[#8931BA]/10"
              }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard
                className={`w-4 h-4 ${isCreditOpen ? "text-white" : "text-[#8931BA]"
                  }`}
                strokeWidth={2}
              />
            )}

            <span className="font-medium flex items-center gap-1 justify-center">
              Total Credits :
              <span
                className={
                  isCreditOpen ? "text-white" : "font-bold text-[#8931BA]"
                }
              >
                {loading ? "..." : totalCredits}
              </span>
            </span>

            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isCreditOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isCreditOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-[10px] tracking-widest text-gray-400 font-bold">
                  Credit Breakdown
                </p>
              </div>

              <div className="p-2">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Briefcase size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Job Credits
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {jobCredits}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                      <Database size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      DB Credits
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {databaseCredits}
                  </span>
                </div>
              </div>

              <div className="p-2 pt-0 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsBuyCreditsOpen(true);
                    setIsCreditOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl shadow-sm text-center block cursor-pointer"
                >
                  + Buy Database Credits
                </button>

                <button
                  onClick={() => {
                    navigate("/plan/credit-usage");
                    setIsCreditOpen(false);
                  }}
                  className="w-full p-2.5 text-xs font-bold text-[#8931BA] bg-[#8931BA]/5 hover:bg-[#8931BA]/10 transition-colors tracking-tight rounded-xl text-center block cursor-pointer"
                >
                  View Usage History
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-[1px] bg-purple-200 mx-1" />

        <div
          onClick={handleNotificationClick}
          className="relative p-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all group active:scale-90"
        >
          <Bell
            className="w-5 h-5 text-gray-500 group-hover:text-[#8931BA] transition-colors"
            strokeWidth={2}
          />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-2 right-2 min-w-4 h-4 px-1 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[9px] font-extrabold">
                {unreadCount}
              </span>
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-40" />
            </>
          )}
        </div>
      </div>

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </header>
  );
};

export default Navbar;