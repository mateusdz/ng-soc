import { env } from "../config/env";

const connections = [
  { label: "SOARCA API", value: env.soarcaApiBase },
  { label: "CACAO Roaster route", value: env.roasterBase },
  { label: "CACAO Roaster embed", value: env.roasterEmbedUrl },
  { label: "SOARCA-GUI route", value: env.soarcaGuiBase },
  { label: "SOARCA-GUI embed", value: env.soarcaGuiEmbedUrl },
  { label: "NG-SOAR API/BFF", value: env.ngSoarApiBase }
];

export default function Settings() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Settings / Connections</h1>
        <p className="mt-1 text-slate-600">Route and service configuration for the Phase 1 shell.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-panel">
        <div className="divide-y divide-slate-100">
          {connections.map((connection) => (
            <div key={connection.label} className="grid gap-2 px-5 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="text-sm font-semibold text-slate-600">{connection.label}</div>
              <code className="break-all rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-800">
                {connection.value}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
