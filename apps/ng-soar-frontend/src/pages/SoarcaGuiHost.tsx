import { Activity, AlertCircle, ExternalLink, ListChecks, TerminalSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { env } from "../config/env";
import { listExecutions, listManualTasks, getSystemStatus } from "../services/soarcaApi";
import { humanizeStatus } from "../services/format";

type ExecutionSnapshot = {
  executions: unknown[];
  manualTasks: unknown[];
  status: unknown;
  isConnected: boolean;
};

const emptySnapshot: ExecutionSnapshot = {
  executions: [],
  manualTasks: [],
  status: undefined,
  isConnected: false
};

function getStringField(value: unknown, fields: string[]): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const field of fields) {
    const fieldValue = record[field];
    if (typeof fieldValue === "string" && fieldValue.length > 0) {
      return fieldValue;
    }
  }

  return undefined;
}

function getEmbeddedPath(pathname: string) {
  const path = pathname.replace(/^\/executions/, "");
  return path && path !== "/" ? path : "/monitoring";
}

export default function SoarcaGuiHost() {
  const location = useLocation();
  const [snapshot, setSnapshot] = useState<ExecutionSnapshot>(emptySnapshot);
  const embeddedPath = getEmbeddedPath(location.pathname);
  const iframeSrc = `${env.soarcaGuiEmbedUrl.replace(/\/$/, "")}${embeddedPath}${location.search}`;
  const counts = useMemo(() => {
    const running = snapshot.executions.filter((execution) => {
      const status = getStringField(execution, ["status", "playbook_status"]);
      return status === "ongoing" || status === "running" || status === "await_user_input";
    }).length;

    return {
      total: snapshot.executions.length,
      running,
      manual: snapshot.manualTasks.length
    };
  }, [snapshot.executions, snapshot.manualTasks]);
  const version = getStringField(snapshot.status, ["version"]);

  useEffect(() => {
    let isCurrent = true;

    async function refresh() {
      try {
        const [executions, manualTasks, status] = await Promise.all([
          listExecutions(),
          listManualTasks(),
          getSystemStatus()
        ]);

        if (isCurrent) {
          setSnapshot({ executions, manualTasks, status, isConnected: true });
        }
      } catch {
        if (isCurrent) {
          setSnapshot((current) => ({ ...current, isConnected: false }));
        }
      }
    }

    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => {
      isCurrent = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-100 text-blue-700">
            <TerminalSquare size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">SOARCA-GUI Execution View</h1>
            <p className="text-sm text-slate-600">Hosted inside NG-SOAR for logs, status, and manual runtime input.</p>
          </div>
        </div>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open standalone
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatusTile
          label="SOARCA API"
          value={snapshot.isConnected ? "Connected" : "Unavailable"}
          detail={version ? `Version ${version}` : "Waiting for status"}
          icon={snapshot.isConnected ? Activity : AlertCircle}
          tone={snapshot.isConnected ? "signal" : "warning"}
        />
        <StatusTile
          label="Executions"
          value={String(counts.total)}
          detail={`${counts.running} ${counts.running === 1 ? "active run" : "active runs"}`}
          icon={TerminalSquare}
          tone="cobalt"
        />
        <StatusTile
          label="Manual Tasks"
          value={String(counts.manual)}
          detail={counts.manual > 0 ? "Input required" : "No pending input"}
          icon={ListChecks}
          tone={counts.manual > 0 ? "warning" : "signal"}
        />
      </section>

      <nav className="flex flex-wrap gap-2">
        <ExecutionLink to="/executions/monitoring" active={embeddedPath.startsWith("/monitoring")}>
          Monitoring
        </ExecutionLink>
        <ExecutionLink to="/executions/playbooks" active={embeddedPath.startsWith("/playbooks")}>
          SOARCA Playbooks
        </ExecutionLink>
        <ExecutionLink to="/executions/settings" active={embeddedPath.startsWith("/settings")}>
          Runtime Settings
        </ExecutionLink>
      </nav>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
        <iframe title="SOARCA-GUI" src={iframeSrc} className="h-[calc(100vh-180px)] min-h-[620px] w-full" />
      </section>
    </div>
  );
}

function StatusTile({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "signal" | "cobalt" | "warning";
}) {
  const toneClass = {
    signal: "bg-emerald-50 text-emerald-700",
    cobalt: "bg-blue-50 text-blue-700",
    warning: "bg-amber-50 text-amber-700"
  }[tone];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${toneClass}`}>
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">{humanizeStatus(value)}</p>
      <p className="text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function ExecutionLink({ to, active, children }: { to: string; active: boolean; children: string }) {
  return (
    <Link
      to={to}
      className={[
        "rounded-md border px-3 py-2 text-sm font-semibold",
        active ? "border-cobalt bg-blue-50 text-cobalt" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
