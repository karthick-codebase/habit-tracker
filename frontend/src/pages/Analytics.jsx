import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiLoader,
  FiLogOut,
  FiMenu,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import api from "../utils/api";
import { getUser, clearAuth } from "../utils/auth";
import Sidebar from "../components/layout/Sidebar";

const Analytics = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [habitStats, setHabitStats] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);

  const mobileNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiActivity,
      path: "/dashboard",
    },
    { id: "habits", label: "Habits", icon: FiTarget, path: "/habits" },
    {
      id: "analytics",
      label: "Analytics",
      icon: FiTrendingUp,
      path: "/analytics",
    },
    { id: "settings", label: "Settings", icon: FiUser, path: "/settings" },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      const [overviewRes, habitsRes, dailyRes] = await Promise.all([
        api.get("/analytics/overview"),
        api.get("/analytics/habits"),
        api.get("/analytics/daily"),
      ]);

      if (overviewRes.data?.success) {
        setOverview(overviewRes.data.data.overview);
      }

      if (habitsRes.data?.success) {
        setHabitStats(habitsRes.data.data.habits);
      }

      if (dailyRes.data?.success) {
        setDailyTrends(dailyRes.data.data.dailyTrends);
      }
    } catch (error) {
      console.error("Fetch analytics error:", error);
      toast.error("Unable to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success("You have been logged out");
    navigate("/login", { replace: true });
  };

  const handleMobileNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
    setIsMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-3">
          <FiLoader size={24} className="animate-spin text-indigo-400" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
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
          currentPage="analytics"
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogoClick}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FiTrendingUp size={18} className="text-indigo-300" />
                </div>
                <span className="font-semibold">
                  Habit
                  <span className="text-indigo-400">Flow</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <div className="space-y-1">
                  {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === "/analytics";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleMobileNavigate(item.path)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                          isActive
                            ? "bg-indigo-500/10 text-indigo-300"
                            : "text-slate-400 hover:bg-white/[0.03]"
                        }`}
                      >
                        <Icon size={17} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.03]"
                >
                  <FiLogOut size={17} />
                  Sign out
                </button>
              </div>
            )}
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Analytics
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Track your progress and habit performance over time.
              </p>
            </motion.div>

            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
            >
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiActivity size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Total Habits
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.totalHabits || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCheckCircle size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Total Check-ins
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.totalCheckIns || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCalendar size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Today
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.todayCheckIns || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiTrendingUp size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Today Rate
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.completionRateToday || 0}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiActivity size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Longest Streak
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.longestStreak || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCalendar size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Last 30 Days
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {overview?.last30DaysCheckIns || 0}
                </p>
              </div>
            </motion.div>

            {/* Daily Trends Chart */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold">30-Day Check-in Trends</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your daily completion rate over the last 30 days.
              </p>

              <div className="mt-6 flex items-end gap-1 sm:gap-2">
                {(dailyTrends || []).map((day, index) => {
                  const height = Math.max(4, day?.completionRate ?? 0);
                  const isToday = index === (dailyTrends?.length ?? 0) - 1;

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-2"
                      title={`${day.dateLabel}: ${day.checkInCount} check-ins (${day.completionRate}%)`}
                    >
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          isToday
                            ? "bg-indigo-400"
                            : day.completionRate >= 80
                              ? "bg-emerald-400/80"
                              : day.completionRate >= 50
                                ? "bg-indigo-400/60"
                                : "bg-slate-600/60"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[9px] text-slate-600 sm:text-[10px]">
                        {index % 5 === 0 || isToday ? day.dateLabel : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Habit Statistics */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8"
            >
              <h2 className="text-lg font-semibold">Habit Performance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Individual statistics for each of your habits.
              </p>

              {(habitStats || []).length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] py-12">
                  <FiActivity size={32} className="text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">No habits yet</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Create your first habit to see analytics
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {(habitStats || []).map((habit) => (
                    <div
                      key={habit.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="habit-name-display truncate text-sm font-medium">
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="mt-0.5 truncate text-xs text-slate-600">
                            {habit.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 sm:gap-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Total
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">
                            {habit.totalCheckIns}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Streak
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">
                            {habit.currentStreak}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            30-Day Rate
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">
                            {habit.completionRate}%
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Last Check-in
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">
                            {habit.lastCheckIn
                              ? new Date(habit.lastCheckIn).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Analytics;
