import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import CreateHabitModal from "../components/habits/CreateHabitModal";
import EditHabitModal from "../components/habits/EditHabitModal";
import DeleteHabitDialog from "../components/habits/DeleteHabitDialog";
import HabitHistoryModal from "../components/habits/HabitHistoryModal";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import HabitCard from "../components/dashboard/HabitCard";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import EmptyHabits from "../components/dashboard/EmptyHabits";
import ErrorState from "../components/dashboard/ErrorState";
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

        <Sidebar
          currentPage="dashboard"
          user={user}
          onNavigate={navigate}
          onLogout={handleLogout}
        />

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

export default Dashboard;
