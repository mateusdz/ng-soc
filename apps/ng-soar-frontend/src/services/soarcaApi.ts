import { env } from "../config/env";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.soarcaApiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`SOARCA request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["playbooks", "items", "data", "results"]) {
      if (Array.isArray(record[key])) {
        return record[key];
      }
    }
  }

  return [];
}

export async function listPlaybooks(): Promise<unknown[]> {
  return asArray(await requestJson<unknown>("/playbook/"));
}

export async function listPlaybookMetas(): Promise<unknown[]> {
  return asArray(await requestJson<unknown>("/playbook/meta/"));
}

export async function getPlaybook(id: string): Promise<unknown> {
  return requestJson<unknown>(`/playbook/${encodeURIComponent(id)}`);
}

export async function createPlaybook(playbook: unknown): Promise<unknown> {
  return requestJson<unknown>("/playbook/", {
    method: "POST",
    body: JSON.stringify(playbook)
  });
}

export async function updatePlaybook(id: string, playbook: unknown): Promise<unknown> {
  return requestJson<unknown>(`/playbook/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(playbook)
  });
}

export async function deletePlaybook(id: string): Promise<void> {
  await requestJson<unknown>(`/playbook/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export async function listExecutions(): Promise<unknown[]> {
  return asArray(await requestJson<unknown>("/reporter/"));
}

export async function getExecution(id: string): Promise<unknown> {
  return requestJson<unknown>(`/reporter/${encodeURIComponent(id)}`);
}

export async function listManualTasks(): Promise<unknown[]> {
  return asArray(await requestJson<unknown>("/manual/"));
}

export async function getSystemStatus(): Promise<unknown> {
  return requestJson<unknown>("/status/");
}
