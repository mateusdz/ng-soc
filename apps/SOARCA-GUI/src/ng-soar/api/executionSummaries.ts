/*
 * Copyright (c) 2026 Cyentific AS.
 * All Rights Reserved.
 *
 * This file is part of the Cyentific CACAO Platform.
 * Unauthorized copying, modification, distribution, or commercial use is prohibited.
 */

import { ISODateString } from "@/types";

export type ExecutionSummaryStatus =
  | "successfully_executed"
  | "failed"
  | "ongoing"
  | "await_user_input"
  | "server_side_error"
  | "client_side_error"
  | "timeout_error"
  | "exception_condition_error"
  | "unknown";

export type ExecutionSummary = {
  id: string;
  playbookId: string;
  playbookModified?: ISODateString;
  playbookVersionLabel?: string;
  executionId?: string;
  status: ExecutionSummaryStatus;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  durationMs?: number;
  source: "soarca" | "roaster" | "soarca-gui" | "ng-soar";
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
};

export type ExecutionSummaryByPlaybook = Record<string, ExecutionSummary | undefined>;

async function fetchOptionalFromNgSoarApi<T>(url: string): Promise<T | undefined> {
  const response = await fetch(url);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`NG-SOAR API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const getLastExecutionSummary = (playbookId: string) =>
  fetchOptionalFromNgSoarApi<ExecutionSummary>(
    `/api/ng-soar/playbooks/${encodeURIComponent(playbookId)}/last-execution`,
  );

export async function getExecutionSummaries() {
  const response = await fetch("/api/ng-soar/execution-summaries");

  if (!response.ok) {
    throw new Error(`NG-SOAR API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<ExecutionSummary[]>;
}

function summaryTimestamp(summary: ExecutionSummary) {
  return summary.completedAt ?? summary.startedAt ?? summary.updatedAt ?? summary.createdAt ?? "";
}

export function createLastExecutionSummaryMap(
  summaries: ExecutionSummary[],
): ExecutionSummaryByPlaybook {
  return summaries.reduce<ExecutionSummaryByPlaybook>((byPlaybook, summary) => {
    const existing = byPlaybook[summary.playbookId];

    if (!existing || summaryTimestamp(summary) > summaryTimestamp(existing)) {
      byPlaybook[summary.playbookId] = summary;
    }

    return byPlaybook;
  }, {});
}
