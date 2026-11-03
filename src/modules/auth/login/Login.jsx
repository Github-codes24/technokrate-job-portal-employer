import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiMail, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithPassword, googleLogin, clearError } from "../../../redux/slices/auth/SigninSlice";
import AuthLayout from "./AuthLayout";
import Background from "../../../assets/auth/Vector.png";
import Illustration from "../../../assets/auth/Loginjob.svg";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Email & Password Sign In Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      const res = await dispatch(loginWithPassword({ email: trimmedEmail, password })).unwrap();
      toast.success(res?.message || "Login Successful!");
      navigate("/");
    } catch (err) {
      toast.error(err || "Login failed. Please check your email and password.");
    }
  };

  // Google Login Handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error("Google authentication failed. No credential token received.");
      return;
    }

    try {
      const res = await dispatch(googleLogin({ idToken: credentialResponse.credential })).unwrap();
      toast.success(res?.message || "Login Successful!");
      navigate("/");
    } catch (err) {
      const errorMessage =
        typeof err === "string"
          ? err
          : "No account is associated with this Google account. Please register first.";
      toast.error(errorMessage);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In failed or was cancelled.");
  };

  return (
    <AuthLayout illustration={Illustration} bgImage={Background}>
      <div className="text-center mb-6">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#7900BA] drop-shadow-[0_4px_4px_#AFAFAF66]">
          Sign In
        </h1>
      </div>

      <div className="text-center mb-6">
        <h3 className="font-semibold text-gray-800">Sign In to your account</h3>
        <p className="text-sm text-gray-500 mt-1">
          Access your account to discover top talent to build your ideal team.
        </p>
      </div>

      {/* EMAIL & PASSWORD LOGIN FORM ONLY */}
      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <div>
          <label className="font-medium text-sm text-gray-700 flex items-center gap-1.5 mb-1">
            <FiMail className="text-[#7900BA]" /> Enter Email Address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#F7F8F9] border border-gray-200 p-3 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-sm text-gray-700 flex items-center gap-1.5">
              <FiLock className="text-[#7900BA]" /> Enter Password
            </label>
            <Link to="/forgot-password" className="text-xs text-[#D3AB2A] font-bold hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#F7F8F9] border border-gray-200 p-3 pr-10 rounded-md outline-none focus:ring-2 focus:ring-violet-400 transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7900BA] hover:bg-[#65009e] active:scale-95 text-white font-semibold py-3 rounded-md shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-semibold uppercase">
            OR
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Continue with Google Button */}
        <div className="flex justify-center w-full min-h-[44px]">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            width="100%"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <p className="text-xs font-bold text-center">
          Don't Have An Account?{" "}
          <Link to="/signup" className="text-[#D3AB2A] hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
