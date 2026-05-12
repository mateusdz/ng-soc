import { MarkerType, type Edge, type Node } from "@xyflow/react";

type WorkflowStep = Record<string, unknown>;

export type WorkflowGraph = {
  nodes: Node[];
  edges: Edge[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getWorkflow(rawCacao: unknown): Record<string, WorkflowStep> {
  if (!isRecord(rawCacao)) {
    return {};
  }

  const workflow = rawCacao.workflow ?? rawCacao.workflow_steps ?? rawCacao.workflowSteps;
  if (isRecord(workflow)) {
    return Object.fromEntries(
      Object.entries(workflow).filter((entry): entry is [string, WorkflowStep] => isRecord(entry[1]))
    );
  }

  if (Array.isArray(workflow)) {
    return Object.fromEntries(
      workflow.filter(isRecord).map((step, index) => [
        typeof step.id === "string" ? step.id : `step-${index + 1}`,
        step
      ])
    );
  }

  return {};
}

function asTargets(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(value)) {
    return Object.values(value).flatMap(asTargets);
  }

  return [];
}

function edgeLabels() {
  return [
    ["on_completion", "completion"],
    ["on_success", "success"],
    ["on_failure", "failure"],
    ["on_true", "true"],
    ["on_false", "false"],
    ["next_steps", "next"],
    ["cases", "case"]
  ] as const;
}

function stepTone(type: string) {
  if (type === "start") return "bg-emerald-50 border-emerald-300 text-emerald-900";
  if (type === "end") return "bg-slate-100 border-slate-300 text-slate-900";
  if (type.includes("condition")) return "bg-amber-50 border-amber-300 text-amber-900";
  if (type === "parallel") return "bg-blue-50 border-blue-300 text-blue-900";
  return "bg-white border-slate-300 text-slate-900";
}

function stepLabel(id: string, step: WorkflowStep) {
  const name = typeof step.name === "string" && step.name.trim() ? step.name : id;
  const type = typeof step.type === "string" ? step.type : "step";

  return (
    <div className={`max-w-[220px] rounded-md border px-3 py-2 text-left shadow-sm ${stepTone(type)}`}>
      <div className="truncate text-sm font-semibold">{name}</div>
      <div className="mt-1 truncate text-xs opacity-75">{type}</div>
    </div>
  );
}

export function buildPlaybookGraph(rawCacao: unknown): WorkflowGraph {
  const workflow = getWorkflow(rawCacao);
  const entries = Object.entries(workflow);

  const nodes: Node[] = entries.map(([id, step], index) => ({
    id,
    data: { label: stepLabel(id, step) },
    position: {
      x: (index % 3) * 280,
      y: Math.floor(index / 3) * 150
    },
    draggable: false,
    selectable: false
  }));

  const edges: Edge[] = entries.flatMap(([source, step]) =>
    edgeLabels().flatMap(([field, label]) =>
      asTargets(step[field])
        .filter((target) => Boolean(workflow[target]))
        .map((target, index) => ({
          id: `${source}-${field}-${target}-${index}`,
          source,
          target,
          label,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 1.5 }
        }))
    )
  );

  return { nodes, edges };
}
