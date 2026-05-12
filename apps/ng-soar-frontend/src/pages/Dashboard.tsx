import { BookOpen, CheckCircle2, Clock3, Hand, ShieldAlert, TerminalSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { env } from "../config/env";
import { loadPlaybooks, type PlaybookListResult } from "../services/playbookRepository";

export default function Dashboard() {
  const [result, setResult] = useState<PlaybookListResult>({ playbooks: [], source: "soarca" });

  useEffect(() => {
    let isCurrent = true;

    loadPlaybooks().then((nextResult) => {
      if (isCurrent) {
        setResult(nextResult);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const playbooks = result.playbooks;
  const statCards = [
    { label: "Total playbooks", value: playbooks.length, icon: BookOpen },
    {
      label: "Valid playbooks",
      value: playbooks.filter((playbook) => playbook.cacaoValidationStatus === "valid").length,
      icon: CheckCircle2
    },
    {
      label: "Invalid playbooks",
      value: playbooks.filter((playbook) => playbook.cacaoValidationStatus === "invalid").length,
      icon: ShieldAlert
    },
    {
      label: "Manual-step playbooks",
      value: playbooks.filter((playbook) => playbook.hasManualSteps).length,
      icon: Hand
    }
  ];
  const recentlyModified = [...playbooks]
    .sort((a, b) => (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? ""))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-ink px-6 py-7 text-white shadow-panel">
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-200">NG-SOC demonstration</p>
        <h1 className="mt-2 text-3xl font-semibold">Unified SOAR console</h1>
        <p className="mt-3 max-w-3xl text-slate-200">
          Discover CACAO playbooks from SOARCA, open authoring tools, and route analysts to execution views
          without rebuilding the existing SOAR stack.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                <Icon size={20} className="text-signal" aria-hidden="true" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-ink">{stat.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Recently Modified</h2>
              <p className="text-sm text-slate-600">
                Source: {result.source === "soarca" ? "SOARCA playbook repository" : "mock fallback"}
              </p>
            </div>
            <Clock3 size={20} className="text-slate-500" aria-hidden="true" />
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {recentlyModified.length > 0 ? (
              recentlyModified.map((playbook) => (
                <Link
                  key={playbook.id}
                  to={`/playbooks/${encodeURIComponent(playbook.id)}`}
                  className="block py-3 hover:text-cobalt"
                >
                  <span className="font-medium">{playbook.title}</span>
                  <span className="ml-2 text-sm text-slate-500">{playbook.versionLabel}</span>
                </Link>
              ))
            ) : (
              <p className="py-3 text-sm text-slate-600">No playbooks loaded yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-2">
            <TerminalSquare size={20} className="text-signal" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Quick Links</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <Link className="rounded-md border border-slate-200 px-4 py-3 font-medium hover:bg-slate-50" to="/playbooks">
              Playbook Library
            </Link>
            <a className="rounded-md border border-slate-200 px-4 py-3 font-medium hover:bg-slate-50" href={env.roasterBase}>
              CACAO Roaster
            </a>
            <a
              className="rounded-md border border-slate-200 px-4 py-3 font-medium hover:bg-slate-50"
              href={env.soarcaGuiBase}
            >
              SOARCA-GUI / Execution View
            </a>
            <Link className="rounded-md border border-slate-200 px-4 py-3 font-medium hover:bg-slate-50" to="/settings">
              Settings / Connections
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
