import { RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlaybookTable } from "../components/playbooks/PlaybookTable";
import { filterPlaybooks, savedViews } from "../services/playbookSearch";
import { loadPlaybooks, type PlaybookListResult } from "../services/playbookRepository";
import type { PlaybookCard } from "../types/playbook";

export default function PlaybookLibrary() {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"contains" | "exact">("contains");
  const [view, setView] = useState(savedViews[0]);
  const [author, setAuthor] = useState("");
  const [playbookType, setPlaybookType] = useState("");
  const [label, setLabel] = useState("");
  const [validationStatus, setValidationStatus] = useState("");
  const [manualStep, setManualStep] = useState("");
  const [modifiedFrom, setModifiedFrom] = useState("");
  const [modifiedTo, setModifiedTo] = useState("");
  const [result, setResult] = useState<PlaybookListResult>({ playbooks: [], source: "soarca" });
  const [isLoading, setIsLoading] = useState(true);

  function refreshPlaybooks() {
    setIsLoading(true);
    return loadPlaybooks()
      .then(setResult)
      .finally(() => setIsLoading(false));
  }

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

  const labels = useMemo(
    () => Array.from(new Set(playbooks.flatMap((playbook) => playbook.labels))).sort(),
    [playbooks]
  );

  const filtered = useMemo(() => {
    return filterPlaybooks(playbooks, {
      query,
      searchMode,
      view,
      author,
      playbookType,
      label,
      validationStatus,
      manualStep,
      modifiedFrom,
      modifiedTo
    });
  }, [
    author,
    label,
    manualStep,
    modifiedFrom,
    modifiedTo,
    playbookType,
    playbooks,
    query,
    searchMode,
    validationStatus,
    view
  ]);

  function clearFilters() {
    setQuery("");
    setSearchMode("contains");
    setView(savedViews[0]);
    setAuthor("");
    setPlaybookType("");
    setLabel("");
    setValidationStatus("");
    setManualStep("");
    setModifiedFrom("");
    setModifiedTo("");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Playbook Library</h1>
            <p className="mt-1 text-slate-600">Loaded from SOARCA through the NG-SOAR proxy.</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshPlaybooks()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
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

          <div className="inline-flex rounded-md border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setSearchMode("contains")}
              className={[
                "rounded px-3 py-1.5 text-sm font-medium",
                searchMode === "contains" ? "bg-signal text-white" : "text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              Contains
            </button>
            <button
              type="button"
              onClick={() => setSearchMode("exact")}
              className={[
                "rounded px-3 py-1.5 text-sm font-medium",
                searchMode === "exact" ? "bg-signal text-white" : "text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              Exact
            </button>
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

        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filters
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <select
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">All labels</option>
            {labels.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <select
            value={validationStatus}
            onChange={(event) => setValidationStatus(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">Any validation status</option>
            <option value="valid">Valid</option>
            <option value="invalid">Invalid</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            value={manualStep}
            onChange={(event) => setManualStep(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">Manual step: any</option>
            <option value="yes">Manual step present</option>
            <option value="no">No manual step</option>
          </select>

          <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
            Modified from
            <input
              type="date"
              value={modifiedFrom}
              onChange={(event) => setModifiedFrom(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
            Modified to
            <input
              type="date"
              value={modifiedTo}
              onChange={(event) => setModifiedTo(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal normal-case text-slate-900 outline-none focus:border-signal focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X size={16} aria-hidden="true" />
            Clear filters
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          Showing {filtered.length} of {playbooks.length} playbooks
        </span>
        <span>Source: {result.source === "soarca" ? "SOARCA" : "mock fallback"}</span>
      </div>

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
