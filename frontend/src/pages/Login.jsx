import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../utils/api.js";
import { saveAuth } from "../utils/auth.js";

const initialForm = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationSuccessful = location.state?.registered === true;

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setServerError("");

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (location.state?.registered) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setServerError("");

    const isValid = validate();

    if (!isValid) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const responseData = response.data;

      if (!responseData?.success) {
        throw new Error(responseData?.message || "Unable to sign in.");
      }

      const token = responseData?.data?.token;
      const user = responseData?.data?.user;

      if (!token || !user) {
        throw new Error(
          "Login succeeded, but the authentication data was incomplete.",
        );
      }

      saveAuth(token, user);

      toast.success("Welcome back!");

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to sign in. Please try again.";

      setServerError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at center, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black, transparent 75%)",
          }}
        />
      </div>

      {/* Floating ambient elements */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[8%] top-[18%] hidden h-16 w-16 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm sm:block"
        animate={{
          y: [0, -18, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[16%] right-[8%] hidden h-12 w-12 rounded-full border border-cyan-400/20 bg-cyan-400/5 sm:block"
        animate={{
          y: [0, 15, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_460px]">
          {/* Brand / visual side */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="max-w-xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                  <Sparkles size={21} className="text-indigo-300" />
                </div>

                <span className="text-lg font-semibold tracking-tight">
                  Habit<span className="text-indigo-400">Flow</span>
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
                Build momentum.
                <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  One day at a time.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
                Turn small daily actions into lasting habits. Track your
                progress, protect your streak, and keep moving forward.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-md">
                  <p className="text-2xl font-semibold">01</p>
                  <p className="mt-1 text-sm text-slate-500">Start small</p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-md">
                  <p className="text-2xl font-semibold">∞</p>
                  <p className="mt-1 text-sm text-slate-500">Keep growing</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Login card */}
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.65,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="relative"
          >
            {/* 3D glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-500/20 blur-xl"
            />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
              {/* Card top glow */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
              />

              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                    <Sparkles size={19} className="text-indigo-300" />
                  </div>

                  <span className="text-lg font-semibold">
                    Habit<span className="text-indigo-400">Flow</span>
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  Your journey continues
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sign in to continue building your momentum.
                </p>
              </div>
              {registrationSuccessful && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300"
                >
                  Account created successfully. You can now sign in.
                </div>
              )}

              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
                >
                  {serverError}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition duration-200 ${
                        errors.email
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />
                  </div>

                  {errors.email && (
                    <p id="email-error" className="mt-2 text-xs text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <LockKeyhole
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition duration-200 ${
                        errors.password
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={!isSubmitting ? { scale: 1.01 } : undefined}
                  whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!isSubmitting && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />
                  )}

                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Security note */}
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck
                  size={15}
                  className="shrink-0 text-emerald-400/70"
                />

                <span>
                  Your session is protected with secure authentication.
                </span>
              </div>

              {/* Register */}
              <div className="mt-7 border-t border-white/[0.07] pt-6 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-indigo-300 transition hover:text-indigo-200"
                >
                  Create one
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      {registrationSuccessful && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300"
        >
          Account created successfully. You can now sign in.
        </motion.div>
      )}
    </main>
  );
};

export default Login;
