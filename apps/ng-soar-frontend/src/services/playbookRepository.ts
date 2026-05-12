import { mockPlaybooks } from "../data/mockPlaybooks";
import type { ExecutionStatus } from "../types/execution";
import type { PlaybookCard } from "../types/playbook";
import { extractPlaybookCard } from "./playbookMetadata";
import { getPlaybook, listExecutions, listPlaybooks } from "./soarcaApi";

export type PlaybookSource = "soarca" | "mock-fallback";

export type PlaybookListResult = {
  playbooks: PlaybookCard[];
  source: PlaybookSource;
  error?: string;
};

type ExecutionReport = {
  playbook_id?: string;
  playbookId?: string;
  status?: ExecutionStatus;
  started?: string;
  ended?: string;
  finishedAt?: string;
  lastUpdatedAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toExecutionReport(value: unknown): ExecutionReport | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    playbook_id: typeof value.playbook_id === "string" ? value.playbook_id : undefined,
    playbookId: typeof value.playbookId === "string" ? value.playbookId : undefined,
    status: typeof value.status === "string" ? (value.status as ExecutionStatus) : undefined,
    started: typeof value.started === "string" ? value.started : undefined,
    ended: typeof value.ended === "string" ? value.ended : undefined,
    finishedAt: typeof value.finishedAt === "string" ? value.finishedAt : undefined,
    lastUpdatedAt: typeof value.lastUpdatedAt === "string" ? value.lastUpdatedAt : undefined
  };
}

function executionTimestamp(execution: ExecutionReport) {
  return execution.ended ?? execution.finishedAt ?? execution.lastUpdatedAt ?? execution.started ?? "";
}

async function loadExecutionReports() {
  try {
    return (await listExecutions()).map(toExecutionReport).filter((value): value is ExecutionReport => Boolean(value));
  } catch {
    return [];
  }
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
    const [rawPlaybook, executions] = await Promise.all([getPlaybook(playbookId), loadExecutionReports()]);
    return withLastExecutions([extractPlaybookCard(rawPlaybook)], executions)[0];
  } catch {
    return mockPlaybooks.find((playbook) => playbook.id === playbookId);
  }
}
