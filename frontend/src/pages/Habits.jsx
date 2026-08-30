import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiAlertCircle,
  FiCheck,
  FiLoader,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiRefreshCw,
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
import CreateHabitModal from "../components/habits/CreateHabitModal";
import EditHabitModal from "../components/habits/EditHabitModal";
import DeleteHabitDialog from "../components/habits/DeleteHabitDialog";
import HabitHistoryModal from "../components/habits/HabitHistoryModal";

const Habits = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [habits, setHabits] = useState([]);
  const [error, setError] = useState("");

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

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Selected habit for edit/delete/history
  const [selectedHabit, setSelectedHabit] = useState(null);

  // Check-ins and streaks for each habit
  const [habitData, setHabitData] = useState({});

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get("/habits");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to load habits");
      }

      const habitsData = response.data?.data?.habits || [];
      setHabits(habitsData);

      // Fetch check-ins and streaks for each habit
      await fetchHabitData(habitsData);
    } catch (err) {
      console.error("Fetch habits error:", err);
      setError("Unable to load your habits");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHabitData = async (habitsList) => {
    const data = {};

    await Promise.all(
      habitsList.map(async (habit) => {
        try {
          const [checkInsRes, streakRes] = await Promise.all([
            api.get(`/habits/${habit.id}/check-ins`),
            api.get(`/habits/${habit.id}/streak`),
          ]);

          data[habit.id] = {
            checkIns: checkInsRes.data?.data?.checkIns || [],
            currentStreak: streakRes.data?.data?.currentStreak || 0,
          };
        } catch (err) {
          console.error(`Fetch habit ${habit.id} data error:`, err);
          data[habit.id] = { checkIns: [], currentStreak: 0 };
        }
      }),
    );

    setHabitData(data);
  };

  const handleRefresh = () => {
    fetchHabits();
  };

  const handleCreateHabit = async () => {
    await fetchHabits();
  };

  const handleEditHabit = async (updatedHabit) => {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === updatedHabit.id ? updatedHabit : habit,
      ),
    );
  };

  const handleDeleteHabit = async (deletedHabit) => {
    setHabits((current) =>
      current.filter((habit) => habit.id !== deletedHabit.id),
    );
    setHabitData((current) => {
      const next = { ...current };
      delete next[deletedHabit.id];
      return next;
    });
  };

  const openEditModal = (habit) => {
    setSelectedHabit(habit);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (habit) => {
    setSelectedHabit(habit);
    setIsDeleteDialogOpen(true);
  };

  const openHistoryModal = (habit) => {
    setSelectedHabit(habit);
    setIsHistoryModalOpen(true);
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
          currentPage="habits"
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
                  <FiTarget size={18} className="text-indigo-300" />
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
                    const isActive = item.path === "/habits";

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

          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Habits
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Manage and track your personal habits.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20"
              >
                <FiPlus size={17} />
                <span className="hidden sm:inline">Create habit</span>
                <span className="sm:hidden">Create</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiTarget size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Total
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {habits.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCheck size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Active Streaks
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {
                    Object.values(habitData).filter((d) => d.currentStreak > 0)
                      .length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiActivity size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Total Check-ins
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-200">
                  {Object.values(habitData).reduce(
                    (sum, d) => sum + d.checkIns.length,
                    0,
                  )}
                </p>
              </div>
            </motion.div>

            {/* Habits List */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Habits</h2>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Refresh habits"
                >
                  <FiRefreshCw
                    size={18}
                    className={isLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>

              {isLoading ? (
                <div className="mt-6 flex items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] py-12">
                  <div className="flex flex-col items-center gap-3">
                    <FiLoader
                      size={24}
                      className="animate-spin text-indigo-400"
                    />
                    <p className="text-sm text-slate-500">Loading habits...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="mt-6 flex items-center justify-center rounded-2xl border border-red-400/[0.1] bg-red-400/[0.02] py-12">
                  <div className="flex flex-col items-center gap-3">
                    <FiAlertCircle size={24} className="text-red-400" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              ) : habits.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] py-16">
                  <FiTarget size={48} className="text-slate-700" />
                  <h3 className="mt-4 text-lg font-medium text-slate-300">
                    No habits yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Create your first habit to start tracking your progress
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20"
                  >
                    <FiPlus size={17} />
                    Create your first habit
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {habits.map((habit) => {
                    const data = habitData[habit.id] || {
                      checkIns: [],
                      currentStreak: 0,
                    };

                    return (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.03]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="habit-name-display text-base font-semibold">
                              {habit.name}
                            </h3>
                            {habit.description && (
                              <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                                {habit.description}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <button
                              onClick={() => openHistoryModal(habit)}
                              className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-2.5 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
                              title="View history"
                            >
                              <FiActivity size={18} />
                            </button>
                            <button
                              onClick={() => openEditModal(habit)}
                              className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-2.5 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
                              title="Edit habit"
                            >
                              <FiRefreshCw size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(habit)}
                              className="rounded-xl border border-red-400/10 bg-red-500/10 p-2.5 text-red-300 transition hover:bg-red-500/15"
                              title="Delete habit"
                            >
                              <FiAlertCircle size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Current Streak
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-200">
                              {data.currentStreak} day
                              {data.currentStreak !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Total Check-ins
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-200">
                              {data.checkIns.length}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Created
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-200">
                              {new Date(habit.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreateHabit}
      />

      <EditHabitModal
        isOpen={isEditModalOpen}
        habit={selectedHabit}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={handleEditHabit}
      />

      <DeleteHabitDialog
        isOpen={isDeleteDialogOpen}
        habit={selectedHabit}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={handleDeleteHabit}
      />

      <HabitHistoryModal
        isOpen={isHistoryModalOpen}
        habit={{
          ...selectedHabit,
          currentStreak: habitData[selectedHabit?.id]?.currentStreak || 0,
        }}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </main>
  );
};

export default Habits;
