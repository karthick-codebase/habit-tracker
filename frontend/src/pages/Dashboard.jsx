import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity,
  FiArrowUpRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiTarget,
  FiTrendingUp,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import CreateHabitModal from "../components/habits/CreateHabitModal";
import EditHabitModal from "../components/habits/EditHabitModal";
import DeleteHabitDialog from "../components/habits/DeleteHabitDialog";
import HabitHistoryModal from "../components/habits/HabitHistoryModal";
import api from "../utils/api";
import { clearAuth, getUser } from "../utils/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isDeleteHabitOpen, setIsDeleteHabitOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryHabit, setSelectedHistoryHabit] = useState(null);

  const [checkInLoading, setCheckInLoading] = useState({});

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Fetch all habits and their check-in information.
   */
  const fetchDashboardData = useCallback(
    async (showInitialLoader = false) => {
      try {
        if (showInitialLoader) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setError("");

        const habitsResponse = await api.get("/habits");

        if (!habitsResponse.data?.success) {
          throw new Error(
            habitsResponse.data?.message || "Unable to retrieve your habits.",
          );
        }

        const fetchedHabits = habitsResponse.data?.data?.habits || [];

        /**
         * Fetch check-ins and streaks concurrently.
         *
         * The current backend exposes these as separate
         * endpoints, so Promise.all prevents sequential
         * requests.
         */
        const enrichedHabits = await Promise.all(
          fetchedHabits.map(async (habit) => {
            try {
              const [checkInsResponse, streakResponse] = await Promise.all([
                api.get(`/habits/${habit.id}/check-ins`),
                api.get(`/habits/${habit.id}/streak`),
              ]);

              const checkIns = checkInsResponse.data?.data?.checkIns || [];

              const currentStreak =
                streakResponse.data?.data?.currentStreak || 0;

              return {
                ...habit,
                checkIns,
                currentStreak,
              };
            } catch (error) {
              console.error(
                `Unable to load check-in data for habit ${habit.id}:`,
                error,
              );

              return {
                ...habit,
                checkIns: [],
                currentStreak: 0,
                checkInDataError: true,
              };
            }
          }),
        );

        setHabits(enrichedHabits);
      } catch (error) {
        console.error("Fetch dashboard data error:", error);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to load your dashboard.";

        setError(message);

        toast.error(message);

        if (error.response?.status === 401) {
          clearAuth();

          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  /**
   * Current local calendar date.
   *
   * This is used only for determining whether a check-in
   * belongs to today on the frontend.
   *
   * The backend remains the source of truth for creating
   * the check-in and calculating the user's local date.
   */
  const today = useMemo(() => {
    const timezone = user?.timezone || "UTC";

    return DateTime.now().setZone(timezone).toISODate();
  }, [user?.timezone]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  }, []);

  const firstName = useMemo(() => {
    if (!user?.email) {
      return "there";
    }

    return user.email.split("@")[0];
  }, [user]);

  /**
   * Calculate how many habits have been completed today.
   */
  const completedToday = useMemo(() => {
    return habits.filter((habit) =>
      habit.checkIns?.some((checkIn) => checkIn.localDate === today),
    ).length;
  }, [habits, today]);

  /**
   * Overall completion percentage for today.
   */
  const completionPercentage = useMemo(() => {
    if (habits.length === 0) {
      return 0;
    }

    return Math.round((completedToday / habits.length) * 100);
  }, [completedToday, habits.length]);

  /**
   * Best/current streak across all habits.
   */
  const currentStreak = useMemo(() => {
    if (habits.length === 0) {
      return 0;
    }

    return Math.max(...habits.map((habit) => habit.currentStreak || 0));
  }, [habits]);

  const handleLogout = () => {
    clearAuth();

    toast.success("You have been logged out.");

    navigate("/login", {
      replace: true,
    });
  };

  const handleRefresh = () => {
    fetchDashboardData(false);
  };

  const handleEditHabit = (habit) => {
    if (!habit?.id) {
      toast.error("Unable to identify this habit.");
      return;
    }

    setSelectedHabit(habit);
    setIsEditHabitOpen(true);
  };

  const handleCloseEditHabit = () => {
    setIsEditHabitOpen(false);
    setSelectedHabit(null);
  };
  const handleDeleteHabit = (habit) => {
    if (!habit?.id) {
      toast.error("Unable to identify this habit.");
      return;
    }

    setHabitToDelete(habit);
    setIsDeleteHabitOpen(true);
  };

  const handleCloseDeleteHabit = () => {
    setIsDeleteHabitOpen(false);
    setHabitToDelete(null);
  };

  const handleViewHistory = (habit) => {
    if (!habit?.id) {
      toast.error("Unable to identify this habit.");
      return;
    }

    setSelectedHistoryHabit(habit);
    setIsHistoryOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryOpen(false);
    setSelectedHistoryHabit(null);
  };
  /**
   * Create today's check-in for a habit.
   */
  const handleCheckIn = async (habitId) => {
    if (!habitId) {
      toast.error("Unable to identify this habit.");
      return;
    }

    try {
      setCheckInLoading((current) => ({
        ...current,
        [habitId]: true,
      }));

      const response = await api.post(`/habits/${habitId}/check-ins`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to check in.");
      }

      toast.success(response.data.message || "Habit checked in successfully.");

      /**
       * Refresh the dashboard so:
       *
       * - today's status updates
       * - streak updates
       * - completion percentage updates
       */
      await fetchDashboardData(false);
    } catch (error) {
      console.error("Create check-in error:", error);

      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            "This habit is already checked in today.",
        );

        /**
         * Refresh anyway because the backend may already
         * contain today's check-in.
         */
        await fetchDashboardData(false);

        return;
      }

      if (error.response?.status === 401) {
        clearAuth();

        toast.error("Your session has expired. Please login again.");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to check in. Please try again.",
      );
    } finally {
      setCheckInLoading((current) => ({
        ...current,
        [habitId]: false,
      }));
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* ================================
            DESKTOP SIDEBAR
        ================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-slate-950/50 backdrop-blur-xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col p-5">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                <FiActivity size={19} className="text-indigo-300" />
              </div>

              <div>
                <p className="font-semibold tracking-tight">
                  Habit
                  <span className="text-indigo-400">Flow</span>
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Personal system
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-10 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-indigo-400/10 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300">
                <FiActivity size={17} />
                Dashboard
              </div>

              <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600">
                <FiTarget size={17} />
                Habits
              </div>

              <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600">
                <FiTrendingUp size={17} />
                Analytics
              </div>
            </nav>

            {/* User */}
            <div className="mt-auto">
              <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="truncate text-sm font-medium text-slate-200">
                  {user?.email || "User"}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {user?.timezone || "Timezone unavailable"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-red-400/5 hover:text-red-300"
              >
                <FiLogOut size={17} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* ================================
            MAIN
        ================================= */}

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-slate-950/80 px-4 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FiActivity size={18} className="text-indigo-300" />
                </div>

                <span className="font-semibold">
                  Habit
                  <span className="text-indigo-400">Flow</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-white/[0.07] pt-4">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/[0.03]"
                    >
                      <FiLogOut size={17} />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {/* ================================
                WELCOME
            ================================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            >
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-indigo-400">
                  <FiCalendar size={13} />
                  {formattedDate}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Good to see you,{" "}
                  <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                    {firstName}
                  </span>
                  .
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Small actions become remarkable results when you repeat them
                  consistently.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    size={16}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20"
                >
                  <FiPlus size={17} />
                  New habit
                </button>
              </div>
            </motion.section>

            {/* ================================
                STATS
            ================================= */}

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<FiTarget size={19} />}
                label="Total habits"
                value={isLoading ? "—" : habits.length}
                description="Active routines"
                delay={0.05}
              />

              <StatCard
                icon={<FiCheckCircle size={19} />}
                label="Completed today"
                value={isLoading ? "—" : `${completedToday}/${habits.length}`}
                description={
                  habits.length > 0
                    ? `${completionPercentage}% completed`
                    : "No habits yet"
                }
                delay={0.1}
              />

              <StatCard
                icon={<FiTrendingUp size={19} />}
                label="Today's progress"
                value={isLoading ? "—" : `${completionPercentage}%`}
                description="Daily completion"
                delay={0.15}
              />

              <StatCard
                icon={<FiClock size={19} />}
                label="Current streak"
                value={isLoading ? "—" : `${currentStreak}d`}
                description="Best active streak"
                delay={0.2}
              />
            </section>

            {/* ================================
                HABITS
            ================================= */}

            <section className="mt-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Your habits</h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Show up today. Let consistency do the rest.
                  </p>
                </div>

                {habits.length > 0 && (
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1 text-xs text-slate-500">
                    {habits.length} {habits.length === 1 ? "habit" : "habits"}
                  </span>
                )}
              </div>

              {isLoading ? (
                <DashboardSkeleton />
              ) : error ? (
                <ErrorState
                  message={error}
                  onRetry={() => fetchDashboardData(true)}
                />
              ) : habits.length === 0 ? (
                <EmptyHabits onCreateHabit={() => setIsCreateHabitOpen(true)} />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <AnimatePresence>
                    {habits.map((habit, index) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        index={index}
                        today={today}
                        isCheckingIn={Boolean(checkInLoading[habit.id])}
                        onCheckIn={handleCheckIn}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                        onViewHistory={handleViewHistory}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
      <CreateHabitModal
        isOpen={isCreateHabitOpen}
        onClose={() => setIsCreateHabitOpen(false)}
        onCreated={async () => {
          await fetchDashboardData(false);
        }}
      />

      <EditHabitModal
        isOpen={isEditHabitOpen}
        habit={selectedHabit}
        onClose={handleCloseEditHabit}
        onUpdated={async () => {
          await fetchDashboardData(false);
          handleCloseEditHabit();
        }}
      />
      <DeleteHabitDialog
        isOpen={isDeleteHabitOpen}
        habit={habitToDelete}
        onClose={handleCloseDeleteHabit}
        onDeleted={async () => {
          handleCloseDeleteHabit();
          await fetchDashboardData(false);
        }}
      />
      <HabitHistoryModal
        isOpen={isHistoryOpen}
        habit={selectedHistoryHabit}
        onClose={handleCloseHistory}
      />
    </main>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({ icon, label, value, description, delay }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-indigo-400/15 hover:bg-white/[0.035]"
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition group-hover:bg-indigo-500/10" />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/5 text-indigo-300">
            {icon}
          </div>

          <FiArrowUpRight
            size={16}
            className="text-slate-700 transition group-hover:text-indigo-400"
          />
        </div>

        <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>

        <p className="mt-1 text-xs text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
};

/* =====================================================
   HABIT CARD
===================================================== */

const HabitCard = ({
  habit,
  index,
  today,
  isCheckingIn,
  onCheckIn,
  onEdit,
  onDelete,
  onViewHistory,
}) => {
  const isCompletedToday =
    habit.checkIns?.some((checkIn) => checkIn.localDate === today) || false;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -4,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition ${
        isCompletedToday
          ? "border-emerald-400/15 bg-emerald-400/[0.025]"
          : "border-white/[0.07] bg-slate-900/60"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition ${
          isCompletedToday
            ? "bg-emerald-500/10"
            : "bg-indigo-500/5 group-hover:bg-indigo-500/10"
        }`}
      />

      <div className="relative">
        {/* Card header */}
        {/* Card header */}
        <div>
          {/* Habit identity */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isCompletedToday
                  ? "border-emerald-400/20 bg-emerald-400/10"
                  : "border-indigo-400/10 bg-indigo-500/5"
              }`}
            >
              {isCompletedToday ? (
                <FiCheck size={19} className="text-emerald-300" />
              ) : (
                <FiTarget size={19} className="text-indigo-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate font-medium text-slate-200">
                  {habit.name}
                </h3>

                <div
                  className={`hidden shrink-0 items-center rounded-full border px-2.5 py-1 text-xs sm:flex ${
                    isCompletedToday
                      ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
                      : "border-white/[0.07] text-slate-600"
                  }`}
                >
                  {isCompletedToday ? "Done" : "Today"}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Created {new Date(habit.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(habit)}
                disabled={isCheckingIn}
                className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-indigo-400/20 hover:bg-indigo-500/5 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Edit ${habit.name}`}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(habit)}
                disabled={isCheckingIn}
                className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-red-400/20 hover:bg-red-500/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Delete ${habit.name}`}
              >
                Delete
              </button>
            </div>

            {/* Mobile status */}
            <div
              className={`flex h-8 items-center rounded-full border px-2.5 text-xs sm:hidden ${
                isCompletedToday
                  ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
                  : "border-white/[0.07] text-slate-600"
              }`}
            >
              {isCompletedToday ? "Done" : "Today"}
            </div>
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
            {habit.description}
          </p>
        )}

        {/* Streak */}
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-700">
              Current streak
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-300">
              {habit.currentStreak || 0}{" "}
              {habit.currentStreak === 1 ? "day" : "days"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-700">
              Check-ins
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-300">
              {habit.checkIns?.length || 0}
            </p>
          </div>
        </div>
        {/* History */}
        <button
          type="button"
          onClick={() => onViewHistory(habit)}
          disabled={isCheckingIn}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`View history for ${habit.name}`}
        >
          <FiCalendar size={16} />
          View history
        </button>

        
        {/* Action */}
        <button
          type="button"
          disabled={isCompletedToday || isCheckingIn}
          onClick={() => onCheckIn(habit.id)}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
            isCompletedToday
              ? "cursor-default border border-emerald-400/10 bg-emerald-400/5 text-emerald-300"
              : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          }`}
        >
          {isCheckingIn ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Checking in...
            </>
          ) : isCompletedToday ? (
            <>
              <FiCheckCircle size={16} />
              Completed today
            </>
          ) : (
            <>
              <FiCheck size={16} />
              Check in today
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
};

/* =====================================================
   LOADING STATE
===================================================== */

const DashboardSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
        />
      ))}
    </div>
  );
};

/* =====================================================
   EMPTY STATE
===================================================== */

const EmptyHabits = ({ onCreateHabit }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/10 bg-indigo-500/5">
        <FiTarget size={24} className="text-indigo-300" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">Your habit system is empty</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Start with one meaningful habit. Consistency is built one small action
        at a time.
      </p>

      <button
        type="button"
        onClick={onCreateHabit}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/15"
      >
        <FiPlus size={16} />
        Create your first habit
      </button>
    </div>
  );
};

/* =====================================================
   ERROR STATE
===================================================== */

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.03] px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-400/10 bg-red-400/5">
        <FiActivity size={20} className="text-red-400" />
      </div>

      <h3 className="mt-4 font-semibold">Couldn't load your dashboard</h3>

      <p className="mt-2 text-sm text-slate-600">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07]"
      >
        Try again
      </button>
    </div>
  );
};

export default Dashboard;
