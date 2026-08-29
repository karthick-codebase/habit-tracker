import { FiTarget, FiCheck, FiCheckCircle, FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";

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
                <h3 className="habit-name-display truncate font-medium">
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

export default HabitCard;
