import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLoader,
  FiTarget,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import api from "../../utils/api";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (value) => String(value).padStart(2, "0");

const formatDateKey = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const getTodayKey = () => {
  const today = new Date();

  return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
};

const getMonthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const HabitHistoryModal = ({ isOpen, habit, onClose }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  /*
   * Reset the calendar to the current month whenever
   * another habit is opened.
   */
  useEffect(() => {
    if (!isOpen || !habit) {
      return;
    }

    const today = new Date();

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [isOpen, habit?.id]);

  /*
   * Fetch check-in history when the modal opens.
   */
  useEffect(() => {
    if (!isOpen || !habit?.id) {
      return;
    }

    let isMounted = true;

    const fetchCheckIns = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get(`/habits/${habit.id}/check-ins`);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Unable to retrieve check-in history.",
          );
        }

        const records = response.data?.data?.checkIns || [];

        if (isMounted) {
          setCheckIns(records);
        }
      } catch (error) {
        console.error("Get habit history error:", error);

        if (!isMounted) {
          return;
        }

        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to load check-in history.";

        setErrorMessage(message);
        setCheckIns([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCheckIns();

    return () => {
      isMounted = false;
    };
  }, [isOpen, habit?.id]);

  /*
   * Escape key support.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  /*
   * Convert check-ins into a Set so calendar lookup
   * is O(1).
   *
   * Example:
   * "2026-08-26"
   */
  const checkInDates = useMemo(() => {
    return new Set(
      checkIns.map((checkIn) => checkIn.localDate).filter(Boolean),
    );
  }, [checkIns]);

  /*
   * Calendar calculations.
   */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      const date = new Date(year, month, -i);

      previousMonthDays.push({
        day: date.getDate(),
        dateKey: formatDateKey(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ),
        isCurrentMonth: false,
      });
    }

    const currentMonthDays = [];

    for (let day = 1; day <= daysInMonth; day += 1) {
      currentMonthDays.push({
        day,
        dateKey: formatDateKey(year, month, day),
        isCurrentMonth: true,
      });
    }

    /*
     * Fill the final row so the calendar always has
     * complete weeks.
     */
    const totalCells = previousMonthDays.length + currentMonthDays.length;

    const remainingCells = (7 - (totalCells % 7)) % 7;

    const nextMonthDays = [];

    for (let day = 1; day <= remainingCells; day += 1) {
      const date = new Date(year, month + 1, day);

      nextMonthDays.push({
        day: date.getDate(),
        dateKey: formatDateKey(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ),
        isCurrentMonth: false,
      });
    }

    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  const todayKey = getTodayKey();

  /*
   * Don't allow navigation into future months.
   */
  const canGoNext = useMemo(() => {
    const today = new Date();

    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();

    return (
      currentYear < todayYear ||
      (currentYear === todayYear && currentMonthIndex < todayMonth)
    );
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    if (!canGoNext) {
      return;
    }

    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  /*
   * Statistics.
   */
  const totalCheckIns = checkIns.length;

  const completedThisMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    return checkIns.filter((checkIn) => {
      if (!checkIn.localDate) {
        return false;
      }

      const [checkYear, checkMonth] = checkIn.localDate.split("-").map(Number);

      return checkYear === year && checkMonth === month + 1;
    }).length;
  }, [checkIns, currentMonth]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && habit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleBackdropClick}
          className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="habit-history-title"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative my-6 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#07101f] shadow-2xl shadow-black/60"
          >
            {/* Ambient effects */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-violet-500/5 blur-3xl"
            />

            {/* Header */}
            <div className="relative border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10">
                    <FiCalendar size={20} className="text-indigo-300" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-indigo-400/70">
                      Habit history
                    </p>

                    <h2
                      id="habit-history-title"
                      className="habit-name-display mt-1 truncate text-lg font-semibold text-white"
                    >
                      {habit.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-xl p-2 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300"
                  aria-label="Close habit history"
                >
                  <FiX size={19} />
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="relative grid grid-cols-2 gap-3 border-b border-white/[0.06] px-5 py-4 sm:grid-cols-3 sm:px-7">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiTarget size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Total
                  </span>
                </div>

                <p className="mt-1 text-lg font-semibold text-slate-200">
                  {totalCheckIns}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCheck size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    This month
                  </span>
                </div>

                <p className="mt-1 text-lg font-semibold text-slate-200">
                  {completedThisMonth}
                </p>
              </div>

              <div className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:col-span-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiClock size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    Current streak
                  </span>
                </div>

                <p className="mt-1 text-lg font-semibold text-slate-200">
                  {habit.currentStreak || 0}{" "}
                  <span className="text-xs font-normal text-slate-600">
                    {habit.currentStreak === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>

            {/* Calendar */}
            <div className="relative px-5 py-5 sm:px-7 sm:py-6">
              {/* Month navigation */}
              <div className="mb-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-indigo-400/20 hover:bg-indigo-500/5 hover:text-indigo-300"
                  aria-label="Previous month"
                >
                  <FiChevronLeft size={17} />
                </button>

                <div className="text-center">
                  <h3 className="text-sm font-semibold text-slate-200">
                    {getMonthLabel(currentMonth)}
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-700">
                    Habit activity
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={!canGoNext}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-indigo-400/20 hover:bg-indigo-500/5 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-20"
                  aria-label="Next month"
                >
                  <FiChevronRight size={17} />
                </button>
              </div>

              {/* Legend */}
              <div className="mb-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-600">Completed</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full border border-indigo-400/60" />
                  <span className="text-[10px] text-slate-600">Today</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/[0.06]" />
                  <span className="text-[10px] text-slate-600">
                    Not completed
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <FiLoader
                      size={22}
                      className="animate-spin text-indigo-400"
                    />

                    <p className="text-xs text-slate-600">Loading history...</p>
                  </div>
                </div>
              ) : errorMessage ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/5">
                      <FiCalendar size={18} className="text-red-400" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-slate-300">
                      Unable to load history
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Weekdays */}
                  <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day}
                        className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-slate-700"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <motion.div
                    key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="grid grid-cols-7 gap-1.5 sm:gap-2"
                  >
                    {calendarDays.map((calendarDay) => {
                      const isCompleted = checkInDates.has(calendarDay.dateKey);

                      const isToday = calendarDay.dateKey === todayKey;

                      const isFuture = calendarDay.dateKey > todayKey;

                      return (
                        <div
                          key={calendarDay.dateKey}
                          className={`relative flex aspect-square min-h-[38px] items-center justify-center rounded-xl border transition sm:min-h-[48px] ${
                            !calendarDay.isCurrentMonth
                              ? "border-transparent text-slate-800"
                              : isCompleted
                                ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
                                : isToday
                                  ? "border-indigo-400/40 bg-indigo-500/5 text-indigo-300"
                                  : isFuture
                                    ? "border-transparent bg-white/[0.01] text-slate-800"
                                    : "border-white/[0.045] bg-white/[0.015] text-slate-600"
                          }`}
                          title={
                            calendarDay.isCurrentMonth
                              ? calendarDay.dateKey
                              : undefined
                          }
                        >
                          <span
                            className={`text-xs font-medium ${
                              !calendarDay.isCurrentMonth ? "opacity-40" : ""
                            }`}
                          >
                            {calendarDay.day}
                          </span>

                          {isCompleted && calendarDay.isCurrentMonth && (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400 sm:bottom-1.5" />
                          )}

                          {isToday &&
                            !isCompleted &&
                            calendarDay.isCurrentMonth && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-400 sm:bottom-1.5" />
                            )}

                          {isFuture && calendarDay.isCurrentMonth && (
                            <span className="absolute bottom-1 text-[7px] text-slate-800">
                              •
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="relative border-t border-white/[0.06] px-5 py-4 sm:px-7">
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-700">
                <FiClock size={12} />
                Check-ins are recorded using your account timezone.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HabitHistoryModal;
