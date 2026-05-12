import { ExternalLink, Flame } from "lucide-react";
import { useLocation } from "react-router-dom";
import { env } from "../config/env";

export default function RoasterHost() {
  const location = useLocation();
  const embeddedPath = location.pathname.replace(/^\/roaster/, "") || "/";
  const iframeSrc = `${env.roasterEmbedUrl.replace(/\/$/, "")}${embeddedPath}${location.search}`;

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-panel lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-100 text-orange-700">
            <Flame size={22} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">CACAO Roaster</h1>
            <p className="text-sm text-slate-600">Hosted inside NG-SOAR for authoring, validation, and execution.</p>
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

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
        <iframe title="CACAO Roaster" src={iframeSrc} className="h-[calc(100vh-180px)] min-h-[620px] w-full" />
      </section>
    </div>
  );
}
