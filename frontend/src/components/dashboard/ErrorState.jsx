import { FiActivity } from "react-icons/fi";

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

export default ErrorState;
