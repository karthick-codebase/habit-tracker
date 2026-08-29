import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiLoader,
  FiLock,
  FiLogOut,
  FiMail,
  FiSave,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";
import { getUser, clearAuth } from "../utils/auth";
import Sidebar from "../components/layout/Sidebar";
import { POPULAR_TIMEZONES } from "../utils/timezones";

const Settings = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Profile update form
  const [profileForm, setProfileForm] = useState({
    email: "",
    timezone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/user");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to load profile");
      }

      const userData = response.data?.data?.user;
      setUserProfile(userData);
      setProfileForm({
        email: userData.email || "",
        timezone: userData.timezone || "",
      });
    } catch (error) {
      console.error("Fetch user profile error:", error);
      toast.error("Unable to load your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    setProfileErrors((current) => {
      const next = { ...current };
      delete next[name];
      delete next.form;
      return next;
    });
  };

  const validateProfile = () => {
    const errors = {};

    if (
      profileForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (profileForm.email && profileForm.email.length > 255) {
      errors.email = "Email must not exceed 255 characters";
    }

    if (profileForm.timezone && profileForm.timezone.length > 100) {
      errors.timezone = "Timezone is too long";
    }

    if (!profileForm.email && !profileForm.timezone) {
      errors.form = "Please provide at least one field to update";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    if (!validateProfile()) {
      return;
    }

    try {
      setIsUpdatingProfile(true);

      const payload = {};
      if (profileForm.email && profileForm.email !== userProfile.email) {
        payload.email = profileForm.email.trim().toLowerCase();
      }
      if (
        profileForm.timezone &&
        profileForm.timezone !== userProfile.timezone
      ) {
        payload.timezone = profileForm.timezone.trim();
      }

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await api.put("/user", payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to update profile");
      }

      toast.success("Profile updated successfully");

      const updatedUser = response.data?.data?.user;
      setUserProfile(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setProfileForm({
        email: updatedUser.email,
        timezone: updatedUser.timezone,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      const serverErrors = error.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const mappedErrors = {};
        serverErrors.forEach((item) => {
          if (item.field) mappedErrors[item.field] = item.message;
        });
        setProfileErrors(mappedErrors);
      } else {
        setProfileErrors({
          form: error.response?.data?.message || "Unable to update profile",
        });
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => {
      const next = { ...current };
      delete next[name];
      delete next.form;
      return next;
    });
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (passwordForm.newPassword.length > 72) {
      errors.newPassword = "Password must not exceed 72 characters";
    }

    if (!passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await api.put("/user/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to change password");
      }

      toast.success("Password changed successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error);

      const serverErrors = error.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const mappedErrors = {};
        serverErrors.forEach((item) => {
          if (item.field) mappedErrors[item.field] = item.message;
        });
        setPasswordErrors(mappedErrors);
      } else {
        setPasswordErrors({
          form: error.response?.data?.message || "Unable to change password",
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);

      const response = await api.delete("/user");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to delete account");
      }

      toast.success("Account deleted successfully");

      clearAuth();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error.response?.data?.message || "Unable to delete account");
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success("You have been logged out");
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-3">
          <FiLoader size={24} className="animate-spin text-indigo-400" />
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar
          currentPage="settings"
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FiUser size={18} className="text-indigo-300" />
                </div>
                <span className="font-semibold">
                  Habit
                  <span className="text-indigo-400">Flow</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-300"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Account Settings
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Manage your account preferences and security settings.
              </p>
            </motion.div>

            <div className="mt-8 space-y-8">
              {/* Profile Section */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your email address and timezone.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <AnimatePresence>
                    {profileErrors.form && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3.5 text-sm text-red-300"
                      >
                        <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
                        <span>{profileErrors.form}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email address
                    </label>
                    <div className="relative">
                      <FiMail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        disabled={isUpdatingProfile}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          profileErrors.email
                            ? "border-red-400/30 focus:border-red-400"
                            : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                        }`}
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-2 text-xs text-red-400">
                        {profileErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Timezone
                    </label>
                    <div className="relative">
                      <FiGlobe
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <select
                        name="timezone"
                        value={profileForm.timezone}
                        onChange={handleProfileChange}
                        disabled={isUpdatingProfile}
                        className={`w-full appearance-none rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-10 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          profileErrors.timezone
                            ? "border-red-400/30 focus:border-red-400"
                            : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                        }`}
                      >
                        <option
                          value=""
                          className="bg-slate-900 text-slate-300"
                        >
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
                    {profileErrors.timezone && (
                      <p className="mt-2 text-xs text-red-400">
                        {profileErrors.timezone}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-600">
                      Used to calculate your daily habit progress correctly.
                    </p>
                  </div>

                  {/* Account Info */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                      Account created
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {new Date(userProfile?.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <FiLoader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave size={16} />
                        Save changes
                      </>
                    )}
                  </button>
                </form>
              </motion.section>

              {/* Password Section */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">Change Password</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your password to keep your account secure.
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <AnimatePresence>
                    {passwordErrors.form && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3.5 text-sm text-red-300"
                      >
                        <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
                        <span>{passwordErrors.form}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Current Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Current password
                    </label>
                    <div className="relative">
                      <FiLock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        placeholder="Enter your current password"
                        className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          passwordErrors.currentPassword
                            ? "border-red-400/30 focus:border-red-400"
                            : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        disabled={isChangingPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
                      >
                        {showCurrentPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-xs text-red-400">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      New password
                    </label>
                    <div className="relative">
                      <FiLock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        placeholder="Create a new password"
                        className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          passwordErrors.newPassword
                            ? "border-red-400/30 focus:border-red-400"
                            : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isChangingPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
                      >
                        {showNewPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-xs text-red-400">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <FiLock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        name="confirmNewPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordChange}
                        disabled={isChangingPassword}
                        placeholder="Confirm your new password"
                        className={`w-full rounded-xl border bg-white/[0.035] py-3.5 pl-11 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          passwordErrors.confirmNewPassword
                            ? "border-red-400/30 focus:border-red-400"
                            : "border-white/[0.09] focus:border-indigo-400/60 focus:bg-white/[0.05]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isChangingPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmNewPassword && (
                      <p className="mt-2 text-xs text-red-400">
                        {passwordErrors.confirmNewPassword}
                      </p>
                    )}
                    {passwordForm.newPassword &&
                      passwordForm.newPassword ===
                        passwordForm.confirmNewPassword &&
                      !passwordErrors.confirmNewPassword && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                          <FiCheck size={13} />
                          Passwords match
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isChangingPassword ? (
                      <>
                        <FiLoader size={16} className="animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <FiShield size={16} />
                        Change password
                      </>
                    )}
                  </button>
                </form>
              </motion.section>

              {/* Danger Zone */}
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl border border-red-400/[0.12] bg-red-400/[0.02] p-6 sm:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-red-300">
                    Danger Zone
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Irreversible and destructive actions.
                  </p>
                </div>

                <div className="rounded-xl border border-red-400/[0.08] bg-red-400/[0.02] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">
                        Delete Account
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                    >
                      <FiTrash2 size={16} />
                      Delete account
                    </button>
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeletingAccount) {
                setIsDeleteDialogOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-400/[0.12] bg-[#07101f] shadow-2xl shadow-black/60"
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/10">
                    <FiAlertTriangle size={22} className="text-red-400" />
                  </div>
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingAccount}
                    className="rounded-xl p-2 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiX size={19} />
                  </button>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-semibold text-white">
                    Delete account?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to permanently delete your account?
                    This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 rounded-xl border border-red-400/[0.08] bg-red-400/[0.035] px-4 py-3">
                  <p className="text-xs leading-5 text-red-300/80">
                    This will permanently remove your account, all habits, and
                    check-in history.
                  </p>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeletingAccount}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeletingAccount ? (
                      <>
                        <FiLoader size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={16} />
                        Delete account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Settings;
