import { FiArrowUpRight } from "react-icons/fi";
import { motion } from "framer-motion";

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

export default StatCard;
