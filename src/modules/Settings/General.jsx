import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCompanyProfile } from "../../redux/slices/company/companySlice";
import {
  fetchPreferences,
  fetchPreferenceOptions,
  updatePreferences,
  changePassword,
  changeEmail,
} from "../../redux/slices/settings/preferencesSlice";

function General() {
  const [languageModal, setLanguageModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedLanguages");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [tempLanguages, setTempLanguages] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedLocation");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [tempLocation, setTempLocation] = useState([]);
  const [locationModal, setLocationModal] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.company);
  const { preferences, loading: preferencesLoading } = useSelector(
    (state) => state.preferences || {}
  );

  const [email, setEmail] = useState("");
  const [updateEmailLoading, setUpdateEmailLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchPreferenceOptions());
  }, [dispatch]);

  useEffect(() => {
    if (profileData) {
      const user = profileData.user || profileData;
      setEmail(user.email || "");
    }
  }, [profileData]);

  useEffect(() => {
    if (!profileData) {
      dispatch(getCompanyProfile());
    }
  }, [dispatch, profileData]);

  const handleUpdateEmail = async () => {
    if (!email || !currentPassword) {
      toast.error("Email address and current password are required");
      return;
    }

    setUpdateEmailLoading(true);
    try {
      const res = await dispatch(
        changeEmail({
          newEmail: email,
          password: currentPassword,
        })
      );

      if (changeEmail.fulfilled.match(res)) {
        toast.success(res.payload?.message || "Email address updated successfully!");
        dispatch(getCompanyProfile());
        setCurrentPassword("");
      } else {
        toast.error(res.payload || "Failed to update email address.");
      }
    } catch (err) {
      toast.error("Failed to update email address.");
    } finally {
      setUpdateEmailLoading(false);
    }
  };

  const [showold, setShowold] = useState(false);
  const [shownew, setShowNew] = useState(false);
  const [showconfirm, setShowconfirm] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const handleChangePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setChangePasswordLoading(true);
    try {
      const res = await dispatch(
        changePassword({
          oldPassword,
          newPassword,
          confirmPassword,
        })
      );

      if (changePassword.fulfilled.match(res)) {
        toast.success(res.payload?.message || "Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.payload || "Failed to change password. Please check your current password.");
      }
    } catch (err) {
      toast.error("Failed to change password.");
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const [notificationPreferences, setNotificationPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("notificationPreferences");
      return saved ? JSON.parse(saved) : {
        allNotifications: true,
        jobRecommendations: true,
        jobUpdates: true,
        shortlisted: true,
        rejected: true,
      };
    } catch {
      return {
        allNotifications: true,
        jobRecommendations: true,
        jobUpdates: true,
        shortlisted: true,
        rejected: true,
      };
    }
  });

  const [profileVisibility, setProfileVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem("profileVisibility");
      return (saved || "public").toLowerCase();
    } catch {
      return "public";
    }
  });

  // Helper to format payload exactly as backend expects
  const formatPayload = (notif, visibility, langs, locs) => {
    const languageStr = Array.isArray(langs) ? (langs[0] || "English") : (langs || "English");
    const locationStr = Array.isArray(locs) ? (locs.join(", ") || "Mumbai, India") : (locs || "Mumbai, India");

    return {
      notificationPreferences: {
        allNotifications: !!notif.allNotifications,
        jobRecommendations: !!notif.jobRecommendations,
        jobUpdates: !!notif.jobUpdates,
        shortlisted: !!notif.shortlisted,
        rejected: !!notif.rejected,
      },
      profileVisibility: (visibility || "public").toLowerCase(),
      language: languageStr,
      location: locationStr,
    };
  };

  // Sync state when preferences are loaded from API
  useEffect(() => {
    if (preferences) {
      const notif = preferences.notificationPreferences || preferences.notifications;
      if (notif) {
        setNotificationPreferences({
          allNotifications: notif.allNotifications ?? notif["All Notifications"] ?? true,
          jobRecommendations: notif.jobRecommendations ?? notif["Job Recommendations"] ?? false,
          jobUpdates: notif.jobUpdates ?? notif["Job Updates"] ?? true,
          shortlisted: notif.shortlisted ?? notif["Notify me when hiring person shortlisted me"] ?? true,
          rejected: notif.rejected ?? notif["Notify me when hiring person rejected me"] ?? true,
        });
      }
      if (preferences.profileVisibility || preferences.visibility) {
        setProfileVisibility((preferences.profileVisibility || preferences.visibility).toLowerCase());
      }
      if (preferences.language || preferences.languages) {
        const langVal = preferences.language || preferences.languages;
        const langs = Array.isArray(langVal) ? langVal : [langVal].filter(Boolean);
        if (langs.length) setSelectedLanguages(langs);
      }
      if (preferences.location || preferences.locations) {
        const locVal = preferences.location || preferences.locations;
        const locs = Array.isArray(locVal) ? locVal : [locVal].filter(Boolean);
        if (locs.length) setSelectedLocation(locs);
      }
    }
  }, [preferences]);

  const handleNotificationChange = (key) => {
    setNotificationPreferences((prev) => {
      let updated;
      if (key === "allNotifications") {
        const nextValue = !prev.allNotifications;
        updated = {
          allNotifications: nextValue,
          jobRecommendations: nextValue,
          jobUpdates: nextValue,
          shortlisted: nextValue,
          rejected: nextValue,
        };
      } else {
        const nextVal = !prev[key];
        updated = {
          ...prev,
          [key]: nextVal,
        };
        const allChecked =
          updated.jobRecommendations &&
          updated.jobUpdates &&
          updated.shortlisted &&
          updated.rejected;
        updated.allNotifications = allChecked;
      }

      try {
        localStorage.setItem("notificationPreferences", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      dispatch(
        updatePreferences(
          formatPayload(updated, profileVisibility, selectedLanguages, selectedLocation)
        )
      );
      toast.success("Notification preferences updated!");
      return updated;
    });
  };

  const handleVisibilityChange = (value) => {
    const formatted = value.toLowerCase();
    setProfileVisibility(formatted);
    try {
      localStorage.setItem("profileVisibility", formatted);
    } catch (e) {
      console.error(e);
    }
    dispatch(
      updatePreferences(
        formatPayload(notificationPreferences, formatted, selectedLanguages, selectedLocation)
      )
    );
    toast.success(
      `Profile visibility updated to ${formatted === "public" ? "Public" : "Recruiters only"}`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto pt-0 space-y-4">

      {/* Notification Card */}
      <div className="bg-white border border-gray-400 rounded-xl shadow-md p-4 animate-in fade-in duration-300">
        <h2 className="text-lg font-semibold mb-4">Notification</h2>

        <div className="space-y-3">
          {[
            { key: "allNotifications", label: "All Notifications" },
            { key: "jobRecommendations", label: "Job Recommendations" },
            { key: "jobUpdates", label: "Job Updates" },
            { key: "shortlisted", label: "Notify me when hiring person shortlisted me" },
            { key: "rejected", label: "Notify me when hiring person rejected me" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!notificationPreferences[item.key]}
                onChange={() => handleNotificationChange(item.key)}
                className="w-4 h-4 accent-purple-700 cursor-pointer"
              />
              <label
                className="text-gray-600 text-sm cursor-pointer select-none"
                onClick={() => handleNotificationChange(item.key)}
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Change Password */}
        <div id="change-password-section" className="bg-white border border-gray-400 rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>

          <div>
            <label className="text-sm text-gray-600">Old Password</label>
            <div className="relative">
              <input
                type={showold ? "text" : "password"}
                placeholder="••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 outline-none"
              />
              <span
                onClick={() => setShowold(!showold)}
                className="absolute right-3 top-[13px] cursor-pointer text-gray-500"
              >
                {showold ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">New Password</label>
            <div className="relative">
              <input
                type={shownew ? "text" : "password"}
                placeholder="••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 outline-none"
              />
              <span
                onClick={() => setShowNew(!shownew)}
                className="absolute right-3 top-[13px] cursor-pointer text-gray-500"
              >
                {shownew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <div className="relative">
              <input
                type={showconfirm ? "text" : "password"}
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 outline-none"
              />
              <span
                onClick={() => setShowconfirm(!showconfirm)}
                className="absolute right-3 top-[13px] cursor-pointer text-gray-500"
              >
                {showconfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          <Link to="/forgot-password" className="text-purple-700 text-sm cursor-pointer hover:underline block">
            Forget Password?
          </Link>

          <button
            onClick={handleChangePasswordSubmit}
            disabled={changePasswordLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {changePasswordLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Change Password"
            )}
          </button>
        </div>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Profile Visibility */}
          <div className="bg-white border border-gray-400 rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Profile Visibility</h2>

            <p className="text-sm text-gray-600">
              Who can see your profile?
            </p>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={profileVisibility === "public"}
                  onChange={() => handleVisibilityChange("public")}
                  className="accent-purple-700 cursor-pointer"
                />
                Public
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="radio"
                  name="visibility"
                  value="recruiters only"
                  checked={profileVisibility === "recruiters only"}
                  onChange={() => handleVisibilityChange("recruiters only")}
                  className="accent-purple-700 cursor-pointer"
                />
                Recruiters only
              </label>
            </div>

            <p className="text-xs text-gray-500">
              {profileVisibility === "Public"
                ? "Everyone can view your profile"
                : "Only recruiters can view your profile"}
            </p>
          </div>

          {/* Appearance */}
          <div className="bg-white border border-gray-400 rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Appearances & Preferences
            </h2>

            <div
              onClick={() => {
                setTempLanguages([...selectedLanguages]);
                setLanguageModal(true);
              }}
              className="flex justify-between items-center border border-gray-400 rounded-lg px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="text-sm text-gray-600 truncate">
                {selectedLanguages.length > 0
                  ? selectedLanguages.join(", ")
                  : "Language"}
              </p>

              <IoMdArrowDropdown className="text-gray-500 text-lg" />
            </div>


            <div
              onClick={() => {
                setTempLocation([...selectedLocation]);
                setLocationModal(true);
              }}
              className="flex justify-between items-center border border-gray-400 rounded-lg px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="text-sm text-gray-600 truncate">
                {selectedLocation.length > 0
                  ? selectedLocation.join(", ")
                  : "Location"}
              </p>

              <IoMdArrowDropdown className="text-gray-500 text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Sign in & Security */}
      <div className="bg-white border border-gray-400 rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">Sign in & Security</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 pl-[3px]">Email Id</label>
              <div className="relative">
                <input
                  type={showEmail ? "email" : "password"}
                  placeholder="Email Id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2 pr-10 border border-gray-400 rounded-lg bg-gray-50 outline-none"
                />
                <span
                  onClick={() => setShowEmail(!showEmail)}
                  className="absolute right-3 top-[13px] cursor-pointer text-gray-500"
                >
                  {showEmail ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
            <button
              onClick={handleUpdateEmail}
              disabled={updateEmailLoading}
              className="bg-purple-700 hover:bg-purple-800 disabled:opacity-70 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {updateEmailLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Update Email"
              )}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 pl-[3px]">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-lg bg-gray-50 outline-none"
                />
                <span
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-[13px] cursor-pointer text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const sec = document.getElementById("change-password-section");
                if (sec) {
                  sec.scrollIntoView({ behavior: "smooth" });
                  const firstInput = sec.querySelector("input");
                  if (firstInput) firstInput.focus();
                }
              }}
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
      {languageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 space-y-4">

            <h2 className="text-lg font-semibold">Select Language</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[
                "English",
                "Hindi",
                "Marathi",
                "Tamil",
                "Telugu",
                "Gujarati",
                "Punjabi",
              ].map((lang, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempLanguages.includes(lang)}
                    onChange={() => {
                      if (tempLanguages.includes(lang)) {
                        setTempLanguages(
                          tempLanguages.filter((l) => l !== lang)
                        );
                      } else {
                        setTempLanguages([...tempLanguages, lang]);
                      }
                    }}
                    className="accent-purple-700 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 select-none">{lang}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setLanguageModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setSelectedLanguages(tempLanguages);
                  try {
                    localStorage.setItem("selectedLanguages", JSON.stringify(tempLanguages));
                  } catch (e) {
                    console.error(e);
                  }
                  dispatch(
                    updatePreferences({
                      languages: tempLanguages,
                      locations: selectedLocation,
                      notificationPreferences,
                      profileVisibility,
                    })
                  );
                  toast.success("Language preferences updated successfully!");
                  setLanguageModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {locationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6 space-y-4">

            <h2 className="text-lg font-semibold">Select Location</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[
                "India",
                "California",
                "Brazil",
                "Tamil",
                "France",
                "Other",
              ].map((loc, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempLocation.includes(loc)}
                    onChange={() => {
                      if (tempLocation.includes(loc)) {
                        setTempLocation(
                          tempLocation.filter((l) => l !== loc)
                        );
                      } else {
                        setTempLocation([...tempLocation, loc]);
                      }
                    }}
                    className="accent-purple-700 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 select-none">{loc}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setLocationModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setSelectedLocation(tempLocation);
                  try {
                    localStorage.setItem("selectedLocation", JSON.stringify(tempLocation));
                  } catch (e) {
                    console.error(e);
                  }
                  dispatch(
                    updatePreferences({
                      locations: tempLocation,
                      languages: selectedLanguages,
                      notificationPreferences,
                      profileVisibility,
                    })
                  );
                  toast.success("Location preferences updated successfully!");
                  setLocationModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default General;
