import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusPill } from "../components/playbooks/StatusPill";
import { WorkflowPreview } from "../components/playbooks/WorkflowPreview";
import { env } from "../config/env";
import { formatDateTime, humanizeStatus } from "../services/format";
import { buildPlaybookGraph } from "../services/playbookGraph";
import { loadPlaybook } from "../services/playbookRepository";
import type { PlaybookCard } from "../types/playbook";

export default function PlaybookDetail() {
  const { playbookId } = useParams();
  const [playbook, setPlaybook] = useState<PlaybookCard>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    if (!playbookId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadPlaybook(playbookId)
      .then((nextPlaybook) => {
        if (isCurrent) {
          setPlaybook(nextPlaybook);
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
  }, [playbookId]);

  const workflowGraph = useMemo(() => buildPlaybookGraph(playbook?.rawCacao), [playbook?.rawCacao]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-panel">
        Loading playbook...
      </div>
    );
  }

  if (!playbook || !playbookId) {
    return (
      <div className="space-y-4">
        <Link to="/playbooks" className="inline-flex items-center gap-2 text-sm font-medium text-cobalt">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to playbooks
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
          <h1 className="text-xl font-semibold">Playbook not found</h1>
          <p className="mt-2 text-slate-600">The mock library does not include this playbook.</p>
        </div>
      </div>
    );
  }

  const roasterUrl = `${env.roasterBase.replace(/\/$/, "")}/playbook/${encodeURIComponent(playbook.id)}`;

  return (
    <div className="space-y-5">
      <Link to="/playbooks" className="inline-flex items-center gap-2 text-sm font-medium text-cobalt">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to playbooks
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{playbook.title}</h1>
            <p className="mt-2 max-w-3xl text-slate-600">{playbook.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {playbook.labels.map((label) => (
                <span key={label} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#workflow-preview"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Preview
              <Eye size={16} aria-hidden="true" />
            </a>
            <Link
              to={roasterUrl}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
            >
              Open in Roaster
              <ExternalLink size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div id="workflow-preview" className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
          <h2 className="text-lg font-semibold">Metadata</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Author</dt>
              <dd className="mt-1 text-slate-900">{playbook.author ?? "Not available"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Type</dt>
              <dd className="mt-1 text-slate-900">{playbook.playbookType ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(playbook.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Modified</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(playbook.modifiedAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Version label</dt>
              <dd className="mt-1 break-all text-slate-900">{playbook.versionLabel}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Workflow steps</dt>
              <dd className="mt-1 text-slate-900">{playbook.workflowStepCount}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Validation</dt>
              <dd className="mt-1">
                <StatusPill tone={playbook.cacaoValidationStatus === "valid" ? "good" : "bad"}>
                  {humanizeStatus(playbook.cacaoValidationStatus)}
                </StatusPill>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last execution</dt>
              <dd className="mt-1 text-slate-900">{humanizeStatus(playbook.lastExecutionStatus)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Workflow Preview</h2>
              <p className="text-sm text-slate-600">Read-only graph generated from the CACAO workflow object.</p>
            </div>
            <span className="text-sm text-slate-500">
              {workflowGraph.nodes.length} nodes / {workflowGraph.edges.length} links
            </span>
          </div>
          <div className="mt-4">
            <WorkflowPreview nodes={workflowGraph.nodes} edges={workflowGraph.edges} />
          </div>
        </div>
      </section>
    </div>
  );
}
