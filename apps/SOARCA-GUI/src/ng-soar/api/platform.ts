export type PlatformServiceStatus = "operational" | "degraded" | "down";

export type PlatformServiceHealth = {
  id: string;
  name: string;
  role: string;
  status: PlatformServiceStatus;
  url: string;
  checkedAt: string;
  latencyMs?: number;
  details?: string;
};

export type PlatformHealth = {
  status: PlatformServiceStatus;
  checkedAt: string;
  services: PlatformServiceHealth[];
};

async function fetchNgSoarApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`NG-SOAR API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const getPlatformHealth = () =>
  fetchNgSoarApi<PlatformHealth>("/api/ng-soar/platform/health");

export const getNgSoarOpenApi = () =>
  fetchNgSoarApi<Record<string, unknown>>("/api/ng-soar/openapi.json");
