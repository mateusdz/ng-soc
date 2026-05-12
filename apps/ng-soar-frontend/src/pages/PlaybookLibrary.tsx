import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlaybookTable } from "../components/playbooks/PlaybookTable";
import { filterPlaybooks, savedViews } from "../services/playbookSearch";
import { loadPlaybooks, type PlaybookListResult } from "../services/playbookRepository";
import type { PlaybookCard } from "../types/playbook";

export default function PlaybookLibrary() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState(savedViews[0]);
  const [author, setAuthor] = useState("");
  const [playbookType, setPlaybookType] = useState("");
  const [result, setResult] = useState<PlaybookListResult>({ playbooks: [], source: "soarca" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    loadPlaybooks()
      .then((nextResult) => {
        if (isCurrent) {
          setResult(nextResult);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const playbooks = result.playbooks;

  const authors = useMemo(
    () =>
      Array.from(new Set(playbooks.map((playbook) => playbook.author).filter((value): value is string => Boolean(value)))).sort(),
    [playbooks]
  );

  const playbookTypes = useMemo(
    () =>
      Array.from(
        new Set(playbooks.map((playbook) => playbook.playbookType).filter((value): value is string => Boolean(value)))
      ).sort(),
    [playbooks]
  );

  const filtered = useMemo(() => {
    return filterPlaybooks(playbooks, { query, view, author, playbookType });
  }, [author, playbookType, playbooks, query, view]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Playbook Library</h1>
        <p className="mt-1 text-slate-600">Loaded from SOARCA through the NG-SOAR proxy.</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-lg">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, description, labels, or raw CACAO JSON"
              className="w-full rounded-md border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {savedViews.map((savedView) => (
              <button
                key={savedView}
                type="button"
                onClick={() => setView(savedView)}
                className={[
                  "rounded-md border px-3 py-2 text-sm font-medium",
                  savedView === view
                    ? "border-signal bg-signal text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                {savedView}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All authors</option>
            {authors.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={playbookType}
            onChange={(event) => setPlaybookType(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All playbook types</option>
            {playbookTypes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </section>

      {result.source === "mock-fallback" ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          SOARCA could not be reached, so NG-SOAR is showing mock playbooks. {result.error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-panel">Loading playbooks...</div>
      ) : filtered.length > 0 ? (
        <PlaybookTable playbooks={filtered} />
      ) : (
        <EmptyPlaybookState playbooks={playbooks} />
      )}
    </div>
  );
}

function EmptyPlaybookState({ playbooks }: { playbooks: PlaybookCard[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-panel">
      {playbooks.length === 0
        ? "SOARCA is reachable, but no playbooks are stored yet."
        : "No playbooks match the current search and filters."}
    </div>
  );
}
