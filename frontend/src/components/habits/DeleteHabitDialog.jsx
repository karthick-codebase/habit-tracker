import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiLoader,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import api from "../../utils/api";

const DeleteHabitDialog = ({
  isOpen,
  habit,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isDeleting, onClose]);

  const handleDelete = async () => {
    if (!habit?.id || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await api.delete(
        `/habits/${habit.id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to delete habit."
        );
      }

      toast.success(
        response.data.message ||
          "Habit deleted successfully."
      );

      if (onDeleted) {
        await onDeleted(habit);
      }
    } catch (error) {
      console.error("Delete habit error:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to delete habit. Please try again.";

      toast.error(message);

      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !isDeleting
    ) {
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
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-habit-title"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
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
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-400/[0.12] bg-[#07101f] shadow-2xl shadow-black/60"
          >
            {/* Ambient danger glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-red-500/10 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-orange-500/5 blur-3xl"
            />

            <div className="relative p-6 sm:p-7">
              {/* Icon */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/10">
                  <FiAlertTriangle
                    size={22}
                    className="text-red-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="rounded-xl p-2 text-slate-600 transition hover:bg-white/[0.05] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Close delete dialog"
                >
                  <FiX size={19} />
                </button>
              </div>

              {/* Content */}
              <div className="mt-5">
                <h2
                  id="delete-habit-title"
                  className="text-xl font-semibold tracking-tight text-white"
                >
                  Delete habit?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to permanently
                  delete this habit?
                </p>

                {/* Habit preview */}
                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/10">
                      <FiTrash2
                        size={16}
                        className="text-indigo-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {habit.name}
                      </p>

                      {habit.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-600">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-4 rounded-xl border border-red-400/[0.08] bg-red-400/[0.035] px-4 py-3">
                  <p className="text-xs leading-5 text-red-300/80">
                    This will permanently remove the habit
                    and its associated check-in history.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <FiLoader
                        size={16}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      Delete habit
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteHabitDialog;