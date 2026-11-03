import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, User, Mail, Phone, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { createSupportTicket } from "../../redux/slices/settings/supportSlice";

// ─── Regex Rules ──────────────────────────────────────────────────────────────
// Only letters and spaces — no digits, no special characters
const ALPHA_ONLY = /^[A-Za-z\s]+$/;

// ─── Field-level validator ────────────────────────────────────────────────────
const validateName = (value, label) => {
  if (!value || value.trim() === "") return `${label} is required`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters`;
  if (!ALPHA_ONLY.test(value))
    return `${label} must contain only alphabetic characters (no numbers or special characters)`;
  return "";
};

const validateEmail = (value) => {
  if (!value || value.trim() === "") return "Email is required";
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(value)) return "Enter a valid email address";
  return "";
};

const validateMobile = (value) => {
  if (!value || value.trim() === "") return "Mobile number is required";
  if (!/^[6-9][0-9]{9}$/.test(value))
    return "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
  return "";
};

const validateMessage = (value) => {
  if (!value || value.trim() === "") return "Message is required";
  if (value.trim().length < 10) return "Message must be at least 10 characters";
  return "";
};

// ─── Name Input — strips invalid chars in real-time ──────────────────────────
const NameInput = ({ id, label, value, error, onChange, placeholder }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <User className="w-4 h-4 text-purple-500" />
      {label}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      maxLength={50}
      autoComplete="off"
      // Use a font where 0 and O are clearly different: Roboto Mono has slashed zero
      style={{ fontFamily: "'Roboto Mono', 'Courier New', monospace" }}
      className={`w-full border rounded-xl p-3 outline-none text-sm transition-all bg-gray-50/50
        focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
        ${error ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
      onChange={(e) => {
        // ── Real-time character filter: only allow alphabets and spaces ──
        const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, "");
        onChange(cleaned);
      }}
    />
    {error && (
      <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
    <p className="text-gray-400 text-[10px]">
      Only alphabetic characters (A–Z, a–z) are allowed.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WebsiteContactForm = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    // Clear error as user types
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors = {
      firstName: validateName(form.firstName, "First Name"),
      lastName: validateName(form.lastName, "Last Name"),
      email: validateEmail(form.email),
      mobile: validateMobile(form.mobile),
      message: validateMessage(form.message),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        subject: `Contact Request from ${form.firstName} ${form.lastName}`.trim(),
        message: form.message,
        phone: form.mobile,
        email: form.email,
      };

      const result = await dispatch(createSupportTicket(payload));
      if (createSupportTicket.fulfilled.match(result)) {
        toast.success(result.payload?.message || "Your message/ticket has been sent successfully!");
        setForm({ firstName: "", lastName: "", email: "", mobile: "", message: "" });
        setErrors({});
        onClose();
      } else {
        toast.error(result.payload || "Failed to create support ticket. Please try again.");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Import Roboto Mono for clear 0 vs O distinction */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap');`}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-[95%] sm:w-[500px] max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-5 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Contact Us via Website</h2>
            <p className="text-purple-100 text-xs mt-1">
              Fill in the form and we'll get back to you shortly.
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* First Name + Last Name — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <NameInput
                  id="firstName"
                  label="First Name"
                  placeholder="e.g. Rahul"
                  value={form.firstName}
                  error={errors.firstName}
                  onChange={(val) => setField("firstName", val)}
                />
                <NameInput
                  id="lastName"
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={form.lastName}
                  error={errors.lastName}
                  onChange={(val) => setField("lastName", val)}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4 text-purple-500" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full border rounded-xl p-3 outline-none text-sm transition-all bg-gray-50/50
                    focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                    ${errors.email ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                  onChange={(e) => setField("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Mobile Number
                </label>
                <div className="relative">
                  {/* +91 prefix badge */}
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-300 pr-2.5 select-none">
                    +91
                  </span>
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    value={form.mobile}
                    placeholder="98765 43210"
                    maxLength={10}
                    autoComplete="tel"
                    className={`w-full border rounded-xl p-3 pl-14 outline-none text-sm transition-all bg-gray-50/50
                      focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                      ${errors.mobile ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                    onChange={(e) => {
                      // Strip any non-digit characters
                      let val = e.target.value.replace(/\D/g, "");
                      // Remove leading zeros instantly (e.g. 00..., 0...)
                      val = val.replace(/^0+/, "");
                      setField("mobile", val);
                    }}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.mobile}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  Message
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  placeholder="Describe your query or requirement..."
                  className={`w-full border rounded-xl p-3 outline-none text-sm resize-none transition-all bg-gray-50/50
                    focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                    ${errors.message ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}
                  onChange={(e) => setField("message", e.target.value)}
                />
                {errors.message && (
                  <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebsiteContactForm;
