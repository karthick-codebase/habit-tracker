import { motion } from "framer-motion";

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

export default DashboardSkeleton;
