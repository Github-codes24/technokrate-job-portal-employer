import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { BiSolidShow, BiSolidHide } from "react-icons/bi";
import { GoogleLogin } from "@react-oauth/google";
import { registerEmployer, googleSignup } from "../../../redux/slices/auth/Signupslice";
import AuthLayout from "../login/AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/signup/signup.svg";


const validationSchema = Yup.object({
  orgName: Yup.string()
    .trim()
    .required("Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(50, "Organization name must not exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9\s&.,'-]+$/,
      "Invalid organization name. Only letters, numbers, and spaces are allowed."
    ),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit mobile")
    .required("Mobile is required"),
  email: Yup.string().email("Invalid email").nullable(),
  password: Yup.string()
    .test("password-rules", "Password does not meet requirements", function(value) {
      if (!value) return true; // Optional
      const hasMin = value.length >= 8;
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasSpecial = /[^a-zA-Z0-9]/.test(value);
      const hasNum = /[0-9]/.test(value);
      return hasMin && hasUpper && hasLower && hasSpecial && hasNum;
    })
    .nullable(),
  confirmPassword: Yup.string()
    .test("passwords-match", "Passwords must match", function(value) {
      const { password } = this.parent;
      if (!password) return true;
      return value === password;
    })
    .nullable(),
  terms: Yup.boolean().oneOf([true], "You must accept the terms"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.signup);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      orgName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.orgName,
          mobileNumber: `+91${values.mobile}`,
        };
        if (values.email) payload.email = values.email;
        if (values.password) payload.password = values.password;

        const res = await dispatch(registerEmployer(payload)).unwrap();
        toast.success("Account created successfully!");
        navigate("/signup-verification", {
          state: { mobileNumber: `+91${values.mobile}`, otp: res.otp },
        });
      } catch (err) {
        toast.error(err || "Registration failed");
      }
    },
  });

  const pw = formik.values.password || "";
  const rules = [
    { label: "Use 8 or more characters", met: pw.length >= 8 },
    { label: "One Uppercase character", met: /[A-Z]/.test(pw) },
    { label: "One lowercase character", met: /[a-z]/.test(pw) },
    { label: "One special character", met: /[^a-zA-Z0-9]/.test(pw) },
    { label: "One number", met: /[0-9]/.test(pw) },
  ];

  const inputCls = (field) =>
    `w-full bg-[#F7F8F9] border p-2 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm
    ${formik.touched[field] && formik.errors[field] ? "border-red-400" : "border-gray-200"}`;

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed. No credential token received.");
      return;
    }

    try {
      const res = await dispatch(googleSignup({ idToken: credentialResponse.credential })).unwrap();
      toast.success(res?.message || "Account created successfully! Please sign in.");
      navigate("/login");
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : "Google sign-up failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-Up failed or was cancelled.");
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-3">
        <h1 className="font-extrabold text-2xl text-gray-900">
          Welcome to <span className="text-[#7900BA]">Technokrate Hire</span>
        </h1>
        <p className="text-sm text-[#7900BA] mt-1">
          <Link to="/signup" className="hover:underline">
            Sign up
          </Link>{" "}
          to find your ideal candidate.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center mb-2">{error}</p>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-2">
        <div>
          <input
            name="orgName"
            placeholder="Name of Organization"
            value={formik.values.orgName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("orgName")}
          />
          {formik.touched.orgName && formik.errors.orgName && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.orgName}
            </p>
          )}
        </div>

        <div>
          <div className="flex rounded-md border border-gray-200 bg-[#F7F8F9] focus-within:ring-2 focus-within:ring-violet-400 transition overflow-hidden"
               style={{ borderColor: formik.touched.mobile && formik.errors.mobile ? '#f87171' : '' }}>
            <span className="flex items-center px-3 bg-[#7900BA] text-white text-sm font-semibold select-none whitespace-nowrap">
              +91
            </span>
            <input
              name="mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              value={formik.values.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                formik.setFieldValue("mobile", value);
              }}
              onBlur={formik.handleBlur}
              className="flex-1 bg-transparent p-2 outline-none text-sm"
            />
          </div>
          {formik.touched.mobile && formik.errors.mobile && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.mobile}
            </p>
          )}
        </div>

        <div>
          <input
            name="email"
            type="email"
            placeholder="Email ID"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={inputCls("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-500 mt-0.5">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${inputCls("password")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <BiSolidHide size={16} /> : <BiSolidShow size={16} />}
            </button>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.confirmPassword}
            </p>
          )}
          </div>
          <div className="grid grid-cols-2 gap-x-2 mt-1.5">
            {rules.map((r) => (
              <p
                key={r.label}
                className={`text-[10px] flex items-center gap-1 ${r.met ? "text-green-600" : "text-gray-400"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${r.met ? "bg-green-500" : "bg-gray-300"}`}
                />
                {r.label}
              </p>
            ))}
          </div>
        </div>

        <div>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${inputCls("confirmPassword")} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <BiSolidHide size={16} />
              ) : (
                <BiSolidShow size={16} />
              )}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-0.5">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={formik.values.terms}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#7900BA] focus:ring-[#7900BA] cursor-pointer"
            />
            <label
              htmlFor="terms"
              className="text-[11px] text-gray-500 cursor-pointer"
            >
              By creating an account, you agree to the{" "}
              <Link to="/terms-and-conditions" className="text-[#7900BA] underline">
                Terms of use
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-[#7900BA] underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
          {formik.touched.terms && formik.errors.terms && (
            <p className="text-xs text-red-500">{formik.errors.terms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create an account"}
        </button>

        <p className="text-xs text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#7900BA] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[11px] text-gray-400">
              Or Signup with
            </span>
          </div>
        </div>

        <div className="flex justify-center w-full min-h-[44px]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            width="100%"
            text="signup_with"
            shape="rectangular"
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;

