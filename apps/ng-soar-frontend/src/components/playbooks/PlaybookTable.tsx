import { Link } from "react-router-dom";
import { formatDateTime, humanizeStatus } from "../../services/format";
import type { PlaybookCard } from "../../types/playbook";
import { StatusPill } from "./StatusPill";

type PlaybookTableProps = {
  playbooks: PlaybookCard[];
};

function validationTone(status: PlaybookCard["cacaoValidationStatus"]) {
  if (status === "valid") return "good";
  if (status === "invalid") return "bad";
  return "neutral";
}

export function PlaybookTable({ playbooks }: PlaybookTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Playbook</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Steps</th>
              <th className="px-4 py-3">Validation</th>
              <th className="px-4 py-3">Last execution</th>
              <th className="px-4 py-3">Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {playbooks.map((playbook) => (
              <tr key={playbook.id} className="align-top hover:bg-slate-50">
                <td className="max-w-md px-4 py-4">
                  <Link to={`/playbooks/${encodeURIComponent(playbook.id)}`} className="font-semibold text-cobalt">
                    {playbook.title}
                  </Link>
                  <p className="mt-1 text-slate-600">{playbook.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {playbook.labels.map((label) => (
                      <span key={label} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-700">{playbook.playbookType ?? "Unknown"}</td>
                <td className="px-4 py-4 text-slate-700">
                  {playbook.workflowStepCount}
                  {playbook.hasManualSteps ? (
                    <span className="mt-2 block text-xs font-medium text-amber-700">Manual step</span>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <StatusPill tone={validationTone(playbook.cacaoValidationStatus)}>
                    {humanizeStatus(playbook.cacaoValidationStatus)}
                  </StatusPill>
                </td>
                <td className="px-4 py-4 text-slate-700">{humanizeStatus(playbook.lastExecutionStatus)}</td>
                <td className="px-4 py-4 text-slate-700">{formatDateTime(playbook.modifiedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
