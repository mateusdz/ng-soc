import { mockPlaybooks } from "../data/mockPlaybooks";
import type { ExecutionStatus } from "../types/execution";
import type { PlaybookCard } from "../types/playbook";
import { getLastExecutionSummary, listExecutionSummaries } from "./ngSoarApi";
import { extractPlaybookCard } from "./playbookMetadata";
import { getPlaybook, listExecutions, listPlaybooks } from "./soarcaApi";

export type PlaybookSource = "soarca" | "mock-fallback";

export type PlaybookListResult = {
  playbooks: PlaybookCard[];
  source: PlaybookSource;
  error?: string;
};

type ExecutionReport = {
  id?: string;
  executionId?: string;
  playbook_id?: string;
  playbookId?: string;
  status?: ExecutionStatus;
  started?: string;
  startedAt?: string;
  ended?: string;
  completedAt?: string;
  finishedAt?: string;
  lastUpdatedAt?: string;
  updatedAt?: string;
  createdAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toExecutionReport(value: unknown): ExecutionReport | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    executionId: typeof value.executionId === "string" ? value.executionId : undefined,
    playbook_id: typeof value.playbook_id === "string" ? value.playbook_id : undefined,
    playbookId: typeof value.playbookId === "string" ? value.playbookId : undefined,
    status: typeof value.status === "string" ? (value.status as ExecutionStatus) : undefined,
    started: typeof value.started === "string" ? value.started : undefined,
    startedAt: typeof value.startedAt === "string" ? value.startedAt : undefined,
    ended: typeof value.ended === "string" ? value.ended : undefined,
    completedAt: typeof value.completedAt === "string" ? value.completedAt : undefined,
    finishedAt: typeof value.finishedAt === "string" ? value.finishedAt : undefined,
    lastUpdatedAt: typeof value.lastUpdatedAt === "string" ? value.lastUpdatedAt : undefined,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined
  };
}

function executionTimestamp(execution: ExecutionReport) {
  return (
    execution.completedAt ??
    execution.ended ??
    execution.finishedAt ??
    execution.lastUpdatedAt ??
    execution.updatedAt ??
    execution.startedAt ??
    execution.started ??
    execution.createdAt ??
    ""
  );
}

async function loadLiveExecutionReports() {
  try {
    return (await listExecutions()).map(toExecutionReport).filter((value): value is ExecutionReport => Boolean(value));
  } catch {
    return [];
  }
}

async function loadPersistentExecutionReports() {
  try {
    return (await listExecutionSummaries())
      .map(toExecutionReport)
      .filter((value): value is ExecutionReport => Boolean(value));
  } catch {
    return [];
  }
}

async function loadLastExecutionReport(playbookId: string) {
  try {
    const report = toExecutionReport(await getLastExecutionSummary(playbookId));
    return report ? [report] : [];
  } catch {
    return [];
  }
}

async function loadExecutionReports() {
  const [persistent, live] = await Promise.all([loadPersistentExecutionReports(), loadLiveExecutionReports()]);
  return [...persistent, ...live];
}

function withLastExecutions(playbooks: PlaybookCard[], executions: ExecutionReport[]) {
  return playbooks.map((playbook) => {
    const latest = executions
      .filter((execution) => (execution.playbook_id ?? execution.playbookId) === playbook.id)
      .sort((a, b) => executionTimestamp(b).localeCompare(executionTimestamp(a)))[0];

    if (!latest) {
      return playbook;
    }

    return {
      ...playbook,
      lastExecutionStatus: latest.status ?? playbook.lastExecutionStatus,
      lastExecutionAt: executionTimestamp(latest) || playbook.lastExecutionAt
    };
  });
}

export async function loadPlaybooks(): Promise<PlaybookListResult> {
  try {
    const rawPlaybooks = await listPlaybooks();
    const executions = await loadExecutionReports();
    return {
      playbooks: withLastExecutions(rawPlaybooks.map(extractPlaybookCard), executions),
      source: "soarca"
    };
  } catch (error) {
    return {
      playbooks: mockPlaybooks,
      source: "mock-fallback",
      error: error instanceof Error ? error.message : "Unknown SOARCA error"
    };
  }
}

export async function loadPlaybook(playbookId: string): Promise<PlaybookCard | undefined> {
  try {
    const [rawPlaybook, executions, lastExecution] = await Promise.all([
      getPlaybook(playbookId),
      loadLiveExecutionReports(),
      loadLastExecutionReport(playbookId)
    ]);
    return withLastExecutions([extractPlaybookCard(rawPlaybook)], [...lastExecution, ...executions])[0];
  } catch {
    return mockPlaybooks.find((playbook) => playbook.id === playbookId);
  }
}
