import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCheck,
  FiFileText,
  FiLoader,
  FiPlus,
  FiTarget,
  FiX,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

import api from "../../utils/api";

const INITIAL_FORM = {
  name: "",
  description: "",
};

const CreateHabitModal = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});

    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }

    if (errors.form) {
      setErrors((current) => ({
        ...current,
        form: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      nextErrors.name = "Habit name is required.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Habit name must not exceed 100 characters.";
    }

    if (description.length > 1000) {
      nextErrors.description =
        "Description must not exceed 1000 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const isValid = validate();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };

      const response = await api.post(
        "/habits",
        payload
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to create habit."
        );
      }

      toast.success(
        response.data.message ||
          "Habit created successfully."
      );

      const createdHabit =
        response.data?.data?.habit;

      setForm(INITIAL_FORM);
      setErrors({});

      onClose();

      if (onCreated) {
        await onCreated(createdHabit);
      }
    } catch (error) {
      console.error(
        "Create habit error:",
        error
      );

      if (error.response?.status === 401) {
        setErrors({
          form:
            "Your session has expired. Please login again.",
        });

        return;
      }

      const serverErrors =
        error.response?.data?.errors;

      if (Array.isArray(serverErrors)) {
        const mappedErrors = {};

        serverErrors.forEach((item) => {
          if (item.field) {
            mappedErrors[item.field] =
              item.message;
          }
        });

        setErrors(mappedErrors);

        return;
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to create habit. Please try again.";

      setErrors({
        form: message,
      });

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !isSubmitting
    ) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-habit-title"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
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
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.09] bg-[#07101f] shadow-2xl shadow-black/50"
          >
            {/* Ambient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-cyan-500/5 blur-3xl"
            />

            {/* Header */}
            <div className="relative border-b border-white/[0.07] px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10">
                    <FiTarget
                      size={20}
                      className="text-indigo-300"
                    />
                  </div>

                  <div>
                    <h2
                      id="create-habit-title"
                      className="text-lg font-semibold tracking-tight text-white"
                    >
                      Create a new habit
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Build something worth repeating.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Close create habit dialog"
                >
                  <FiX size={19} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative px-6 py-6 sm:px-7"
            >
              {/* General error */}
              <AnimatePresence>
                {errors.form && (
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
                    className="mb-5 overflow-hidden"
                  >
                    <div className="flex gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3.5 text-sm text-red-300">
                      <FiAlertCircle
                        className="mt-0.5 shrink-0"
                        size={17}
                      />

                      <span>
                        {errors.form}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="habit-name"
                    className="text-sm font-medium text-slate-300"
                  >
                    Habit name
                    <span className="ml-1 text-red-400">
                      *
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-600">
                    {form.name.length}/100
                  </span>
                </div>

                <div
                  className={`relative rounded-xl border transition ${
                    errors.name
                      ? "border-red-400/30 bg-red-400/[0.02]"
                      : "border-white/[0.08] bg-white/[0.025] focus-within:border-indigo-400/30 focus-within:bg-indigo-500/[0.02]"
                  }`}
                >
                  <FiTarget
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    ref={nameInputRef}
                    id="habit-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={100}
                    placeholder="e.g. Read for 30 minutes"
                    autoComplete="off"
                    className="w-full bg-transparent py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {errors.name && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <FiAlertCircle size={13} />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="habit-description"
                    className="text-sm font-medium text-slate-300"
                  >
                    Description
                    <span className="ml-2 text-xs font-normal text-slate-700">
                      Optional
                    </span>
                  </label>

                  <span className="text-[11px] text-slate-600">
                    {form.description.length}/1000
                  </span>
                </div>

                <div
                  className={`relative rounded-xl border transition ${
                    errors.description
                      ? "border-red-400/30 bg-red-400/[0.02]"
                      : "border-white/[0.08] bg-white/[0.025] focus-within:border-indigo-400/30 focus-within:bg-indigo-500/[0.02]"
                  }`}
                >
                  <FiFileText
                    size={17}
                    className="absolute left-3.5 top-3.5 text-slate-600"
                  />

                  <textarea
                    id="habit-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    maxLength={1000}
                    rows={4}
                    placeholder="What makes this habit meaningful to you?"
                    className="w-full resize-none bg-transparent py-3.5 pl-11 pr-4 text-sm leading-6 text-white outline-none placeholder:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {errors.description && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <FiAlertCircle size={13} />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader
                        size={16}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiPlus size={17} />
                      Create habit
                    </>
                  )}
                </button>
              </div>

              {/* Small reassurance */}
              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-700">
                <FiCheck size={13} />
                You can edit or delete this habit later.
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateHabitModal;