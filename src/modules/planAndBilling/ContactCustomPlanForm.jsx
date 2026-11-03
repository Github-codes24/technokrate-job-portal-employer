import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { X, User, Mail, Phone, MessageSquare, Send, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { submitContactCustomPlan, resetContactCustomPlan } from "../../redux/slices/plans/ContactCustomPlanSlice";

const ContactCustomPlanForm = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  
  // 1. Get state from Redux
  const { loading, success, error } = useSelector((state) => state.contactCustomPlan);

  // 2. Handle Success: Close modal and toast
  useEffect(() => {
    if (success && isOpen) {
      toast.success("Employer plan query sent successfully!");
      dispatch(resetContactCustomPlan());
      onClose();
    }
  }, [success, isOpen, dispatch, onClose]);

  // 3. Handle Error: Show toast
  useEffect(() => {
    if (error && isOpen) {
      toast.error(error);
      dispatch(resetContactCustomPlan());
    }
  }, [error, isOpen, dispatch]);

  if (!isOpen) return null;

  const validationSchema = Yup.object().shape({
    // name: Yup.string().required("Name is required").min(2, "Name too short"),
    email: Yup.string()
      .email("Invalid email")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Invalid email format"
      )
      .required("Email is required"),
    phoneNumber: Yup.string()
      .matches(
        /^[6-9][0-9]{9}$/,
        "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
      )
      .required("Phone number is required"),
    message: Yup.string().required("Please enter your requirements").min(10, "Message too short"),
  });

  const handleSubmit = (values) => {
    // 4. Map UI values to API keys seen in Postman
    const payload = {
      phone: values.phoneNumber, // Matches "phone" in Postman
      email: values.email,       // Matches "email" in Postman
      message: `From: ${values.name} - ${values.message}`, // Merging name into message if API doesn't have a name field
    };
    
    dispatch(submitContactCustomPlan(payload));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-[95%] sm:w-[480px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-6 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-sora">Contact for Custom Plan</h2>
          <p className="text-purple-100 text-xs mt-1">
            Build a plan that fits your recruitment needs.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <Formik
            initialValues={{ name: "", email: "", phoneNumber: "", message: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue }) => (
              <Form className="space-y-4">
                {/* Name */}
                {/* <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-purple-500" /> Full Name
                  </label>
                  <Field
                    name="name"
                    placeholder="Enter your name"
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 transition-all text-sm"
                  />
                  <ErrorMessage name="name" component="p" className="text-red-500 text-[10px] mt-1" />
                </div> */}

                {/* Email */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-purple-500" /> Email Address
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="employer@example.com"
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 transition-all text-sm"
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-[10px] mt-1" />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Phone className="w-4 h-4 text-purple-500" /> Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium border-r border-gray-300 pr-2">
                      +91
                    </span>
                    <Field
                      name="phoneNumber"
                      maxLength={10}
                      placeholder="98765 43210"
                      className="w-full border border-gray-200 rounded-xl p-3 pl-14 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 transition-all text-sm"
                      onChange={(e) => {
                        // Strip non-digits first
                        let val = e.target.value.replace(/\D/g, "");
                        // Remove leading zeros (e.g. 00..., 0...)
                        val = val.replace(/^0+/, "");
                        setFieldValue("phoneNumber", val);
                      }}
                    />
                  </div>
                  <ErrorMessage name="phoneNumber" component="p" className="text-red-500 text-[10px] mt-1" />
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MessageSquare className="w-4 h-4 text-purple-500" /> Message
                  </label>
                  <Field
                    as="textarea"
                    name="message"
                    rows={3}
                    placeholder="I want to know more about..."
                    className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 transition-all resize-none text-sm"
                  />
                  <ErrorMessage name="message" component="p" className="text-red-500 text-[10px] mt-1" />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                        <Send className="w-4 h-4" /> Send Enquiry
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ContactCustomPlanForm;