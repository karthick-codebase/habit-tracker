import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiLock,
  FiMail,
  FiShield,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import api from "../utils/api";
import { getDefaultTimezone, POPULAR_TIMEZONES } from "../utils/timezones";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  timezone: getDefaultTimezone(),
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: "",
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return {
      score,
      label: "Weak",
    };
  }

  if (score <= 4) {
    return {
      score,
      label: "Good",
    };
  }

  return {
    score,
    label: "Strong",
  };
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const timezone = formData.timezone.trim();

    if (!name) {
      nextErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name = "Name must not exceed 100 characters.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    } else if (email.length > 255) {
      nextErrors.email = "Email must not exceed 255 characters.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (password.length > 72) {
      nextErrors.password = "Password must not exceed 72 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!timezone) {
      nextErrors.timezone = "Timezone is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setServerError("");

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        timezone: formData.timezone.trim(),
      });

      const responseData = response.data;

      if (!responseData?.success) {
        throw new Error(
          responseData?.message || "Unable to create your account.",
        );
      }

      toast.success(responseData.message || "Account created successfully!");

      setFormData(initialForm);
      setErrors({});

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: formData.email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to create your account. Please try again.";

      const backendErrors = error.response?.data?.errors;

      if (Array.isArray(backendErrors)) {
        const mappedErrors = {};

        backendErrors.forEach((item) => {
          if (item.field && item.message) {
            mappedErrors[item.field] = item.message;
          }
        });

        if (Object.keys(mappedErrors).length > 0) {
          setErrors(mappedErrors);
        }
      }

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
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/15 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.07]"
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

      {/* Floating 3D-inspired shapes */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[6%] top-[15%] hidden h-20 w-20 rounded-3xl border border-indigo-400/10 bg-white/[0.025] backdrop-blur-sm lg:block"
        animate={{
          y: [0, -18, 0],
          rotateX: [0, 10, 0],
          rotateY: [0, -12, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[13%] right-[7%] hidden h-14 w-14 rounded-full border border-cyan-400/20 bg-cyan-400/5 lg:block"
        animate={{
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_480px]">
          {/* Left visual / branding */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="hidden lg:block"
          >
            <div className="max-w-xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                  <FiStar size={21} className="text-indigo-300" />
                </div>

                <span className="text-lg font-semibold tracking-tight">
                  Habit
                  <span className="text-indigo-400">Flow</span>
                </span>
              </div>

              <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">
                Design your
                <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                  better routine.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
                Create your personal habit system and turn consistent actions
                into meaningful progress.
              </p>

              <div className="mt-10 space-y-3">
                {[
                  "Track your daily habits",
                  "Build powerful streaks",
                  "Understand your progress",
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.25 + index * 0.1,
                      duration: 0.45,
                    }}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/15 bg-emerald-400/5">
                      <FiCheck size={13} className="text-emerald-400" />
                    </span>

                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Register card */}
          <motion.section
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.65,
              delay: 0.1,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-500/20 blur-xl"
            />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
              />

              {/* Mobile brand */}
              <div className="mb-7 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                    <FiStar size={19} className="text-indigo-300" />
                  </div>

                  <span className="text-lg font-semibold">
                    Habit
                    <span className="text-indigo-400">Flow</span>
                  </span>
                </div>
              </div>

              <div className="mb-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-400/5 px-3 py-1.5 text-xs font-medium text-indigo-300">
                  <FiStar size={12} />
                  Start your journey
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Build a system that makes consistency easier.
                </p>
              </div>

              {serverError && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
                >
                  <FiX size={17} className="mt-0.5 shrink-0" />

                  <span>{serverError}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Full name
                  </label>

                  <div className="group relative">
                    <FiUser
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="register-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={
                        errors.name ? "register-name-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition duration-200 ${
                        errors.name
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />
                  </div>

                  {errors.name && (
                    <p
                      id="register-name-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <FiMail
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email ? "register-email-error" : undefined
                      }
                      className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition duration-200 ${
                        errors.email
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />
                  </div>

                  {errors.email && (
                    <p
                      id="register-email-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="group relative">
                    <FiLock
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "register-password-error" : undefined
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
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Password strength */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Password strength
                        </span>

                        <span
                          className={`text-[11px] font-medium ${
                            passwordStrength.label === "Strong"
                              ? "text-emerald-400"
                              : passwordStrength.label === "Good"
                                ? "text-amber-400"
                                : "text-red-400"
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              index < passwordStrength.score
                                ? passwordStrength.label === "Strong"
                                  ? "bg-emerald-400"
                                  : passwordStrength.label === "Good"
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p
                      id="register-password-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Confirm password
                  </label>

                  <div className="group relative">
                    <FiLock
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "register-confirm-password-error"
                          : undefined
                      }
                      className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition duration-200 ${
                        errors.confirmPassword
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>

                  {formData.confirmPassword &&
                    !errors.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <FiCheck size={13} />
                        Passwords match
                      </div>
                    )}

                  {errors.confirmPassword && (
                    <p
                      id="register-confirm-password-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label
                    htmlFor="register-timezone"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Timezone
                  </label>

                  <div className="group relative">
                    <FiGlobe
                      aria-hidden="true"
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-indigo-400"
                    />

                    <select
                      id="register-timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(errors.timezone)}
                      aria-describedby={
                        errors.timezone
                          ? "register-timezone-error"
                          : "register-timezone-help"
                      }
                      className={`w-full appearance-none rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-10 text-sm text-white outline-none transition duration-200 ${
                        errors.timezone
                          ? "border-red-400/50 focus:border-red-400"
                          : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="" className="bg-slate-900 text-slate-300">
                        Select your timezone
                      </option>
                      {POPULAR_TIMEZONES.map((zone) => (
                        <option
                          key={zone.value}
                          value={zone.value}
                          className="bg-slate-900 text-slate-200"
                        >
                          {zone.label}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M5.25 7.5 10 12.25 14.75 7.5H5.25Z" />
                      </svg>
                    </div>
                  </div>

                  {errors.timezone ? (
                    <p
                      id="register-timezone-error"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errors.timezone}
                    </p>
                  ) : (
                    <p
                      id="register-timezone-help"
                      className="mt-2 text-xs leading-5 text-slate-600"
                    >
                      Used to calculate your daily habit progress correctly.
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <FiArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Security */}
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                <FiShield size={15} className="shrink-0 text-emerald-400/70" />

                <span>
                  Your password is securely hashed before being stored.
                </span>
              </div>

              {/* Login */}
              <div className="mt-7 border-t border-white/[0.07] pt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-indigo-300 transition hover:text-indigo-200"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
};

export default Register;
