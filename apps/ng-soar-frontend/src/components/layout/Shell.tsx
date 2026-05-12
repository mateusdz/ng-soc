import {
  Activity,
  BookOpen,
  Flame,
  LayoutDashboard,
  Settings,
  TerminalSquare
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { env } from "../../config/env";

type ShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Playbooks", to: "/playbooks", icon: BookOpen },
  { label: "Roaster", to: env.roasterBase, icon: Flame },
  { label: "Executions", to: env.soarcaGuiBase, icon: TerminalSquare },
  { label: "Settings", to: "/settings", icon: Settings }
];

export default function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <a href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-signal text-white">
            <Activity size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold">NG-SOAR</span>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              NG-SOC console
            </span>
          </span>
        </a>

        <nav className="mt-10 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-signal text-white" : "text-slate-700 hover:bg-slate-100"
                  ].join(" ")
                }
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <a href="/dashboard" className="font-semibold">
              NG-SOAR
            </a>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const commonClass =
                  "grid h-10 w-10 place-items-center rounded-md text-slate-700 hover:bg-slate-100";

                return (
                  <NavLink key={item.label} to={item.to} className={commonClass} title={item.label}>
                    <Icon size={18} aria-hidden="true" />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
