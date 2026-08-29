import { FiTarget, FiPlus } from "react-icons/fi";

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

export default EmptyHabits;
