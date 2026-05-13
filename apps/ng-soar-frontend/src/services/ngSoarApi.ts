import { env } from "../config/env";

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${env.ngSoarApiBase}${path}`, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`NG-SOAR API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["executionSummaries", "items", "data", "results"]) {
      if (Array.isArray(record[key])) {
        return record[key];
      }
    }
  }

  return [];
}

export async function listExecutionSummaries(): Promise<unknown[]> {
  return asArray(await requestJson<unknown>("/execution-summaries"));
}

export async function getLastExecutionSummary(playbookId: string): Promise<unknown> {
  return requestJson<unknown>(`/playbooks/${encodeURIComponent(playbookId)}/last-execution`);
}
