import type { ExecutionStatus } from "./execution";

export type ValidationStatus = "unknown" | "valid" | "invalid";

export type PlaybookCard = {
  id: string;
  cacaoId?: string;
  title: string;
  description?: string;
  summary?: string;
  author?: string;
  playbookType?: string;
  labels: string[];
  createdAt?: string;
  modifiedAt?: string;
  versionLabel: string;
  workflowStepCount: number;
  hasManualSteps: boolean;
  cacaoValidationStatus: ValidationStatus;
  lastExecutionStatus?: ExecutionStatus;
  lastExecutionAt?: string;
  rawCacao: unknown;
};
