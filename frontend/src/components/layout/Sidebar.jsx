import {
  FiActivity,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import { formatTimezoneLabel } from "../../utils/timezones";

const Sidebar = ({ currentPage, user, onNavigate, onLogout }) => {
  const navItems = [
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

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-slate-950/50 backdrop-blur-xl lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-5">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
            <FiActivity size={19} className="text-indigo-300" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">
              Habit
              <span className="text-indigo-400">Flow</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Personal system
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            if (isActive) {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-indigo-400/10 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300"
                >
                  <Icon size={17} />
                  {item.label}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-white/[0.03] hover:text-slate-300"
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="truncate text-sm font-medium text-slate-200">
              {user?.name || user?.email || "User"}
            </p>
            <p className="mt-1 text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
              {formatTimezoneLabel(user?.timezone)}
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-red-400/5 hover:text-red-300"
          >
            <FiLogOut size={17} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
