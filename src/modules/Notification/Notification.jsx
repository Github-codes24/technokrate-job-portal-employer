import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Trash2,
  CheckCheck,
  Filter,
  Briefcase,
  User,
  CreditCard,
  Info,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchNotifications,
  deleteNotification,
  clearAllNotifications,
  markOneNotificationRead,
  markAllNotificationsRead,
} from "../../redux/slices/notification/notificationSlice";
import Pagination from "../../components/common/Pagination";

const Notification = () => {
  const dispatch = useDispatch();
  const {
    notifications,
    loading,
    actionLoading,
    error,
    totalNotifications,
    currentPage,
    totalPages,
    unreadCount,
  } = useSelector((state) => state.notification);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState("all");
  const [isReadFilter, setIsReadFilter] = useState("all");

  useEffect(() => {
    dispatch(
      fetchNotifications({
        page,
        limit,
        isRead: isReadFilter,
        type,
      })
    );
  }, [dispatch, page, limit, isReadFilter, type]);

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      dispatch(clearAllNotifications());
    }
  };

  const handleMarkAsRead = (id) => {
    dispatch(markOneNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const getNotificationIcon = (itemType) => {
    switch ((itemType || "").toLowerCase()) {
      case "job":
        return <Briefcase className="w-4 h-4 text-purple-600" />;
      case "candidate":
      case "applicant":
        return <User className="w-4 h-4 text-blue-600" />;
      case "credit":
      case "payment":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-purple-600" />;
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-3 sm:p-6 rounded-2xl">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Stay updated with your job postings, candidate applications, and account activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Read/Unread Filter */}
            <div className="flex rounded-xl bg-gray-100 p-1">
              {[
                { label: "All", val: "all" },
                { label: "Unread", val: "false" },
                { label: "Read", val: "true" },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => {
                    setIsReadFilter(btn.val);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isReadFilter === btn.val
                      ? "bg-white text-purple-700 shadow-xs font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Categories</option>
              <option value="job">Jobs</option>
              <option value="candidate">Candidates</option>
              <option value="credit">Credits & Billing</option>
            </select>
          </div>

          <div className="text-xs text-gray-500">
            Total: <span className="font-semibold text-gray-800">{totalNotifications}</span>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 border border-red-100 shadow-sm text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">Could not load notifications</p>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
            <button
              onClick={() => dispatch(fetchNotifications({ page, limit, isRead: isReadFilter, type }))}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-gray-100 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">No notifications found</h3>
            <p className="text-xs text-gray-500 mt-1">
              You are all caught up! When updates or activity happen, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const id = item._id || item.id;
              const isUnread = !item.isRead && !item.read;

              return (
                <div
                  key={id}
                  onClick={() => {
                    if (isUnread) handleMarkAsRead(id);
                  }}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md cursor-pointer ${
                    isUnread
                      ? "border-purple-200 bg-purple-50/20 shadow-xs"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.type === "job"
                          ? "bg-purple-100"
                          : item.type === "candidate"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"}`}>
                          {item.title || "Notification"}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        )}
                        {item.type && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {item.type}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                        {item.desc || item.description || item.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimestamp(item.createdAt || item.time || item.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(id);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition font-medium"
                      >
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;