import type { PlaybookCard, ValidationStatus } from "../types/playbook";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (isRecord(item)) {
        return firstString(item, ["name", "id", "value"]);
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = stringValue(record[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function extractAuthor(record: Record<string, unknown>): string | undefined {
  const direct = firstString(record, ["created_by", "createdBy", "author", "owner"]);
  if (direct) {
    return direct;
  }

  const createdBy = record.created_by;
  if (isRecord(createdBy)) {
    return firstString(createdBy, ["name", "email", "id"]);
  }

  return undefined;
}

function extractLabels(record: Record<string, unknown>): string[] {
  const labels = arrayOfStrings(record.labels);
  if (labels.length) {
    return labels;
  }

  const tags = arrayOfStrings(record.tags);
  if (tags.length) {
    return tags;
  }

  return arrayOfStrings(record.keywords);
}

function extractWorkflowObjects(record: Record<string, unknown>): unknown[] {
  const workflow = record.workflow ?? record.workflow_steps ?? record.workflowSteps;
  if (Array.isArray(workflow)) {
    return workflow;
  }

  if (isRecord(workflow)) {
    return Object.values(workflow);
  }

  return [];
}

function hasManualStep(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasManualStep);
  }

  if (!isRecord(value)) {
    return typeof value === "string" && /manual|human|user[-_ ]?input/i.test(value);
  }

  return Object.entries(value).some(([key, nested]) => {
    if (/manual|human|user[-_ ]?input/i.test(key)) {
      return true;
    }

    if (typeof nested === "string" && /manual|human|user[-_ ]?input/i.test(nested)) {
      return true;
    }

    return hasManualStep(nested);
  });
}

function extractValidationStatus(record: Record<string, unknown>): ValidationStatus {
  const explicit = firstString(record, ["cacaoValidationStatus", "validation_status", "validationStatus"]);
  if (explicit === "valid" || explicit === "invalid") {
    return explicit;
  }

  return "unknown";
}

export function extractPlaybookCard(rawCacao: unknown): PlaybookCard {
  const record = isRecord(rawCacao) ? rawCacao : {};
  const id = firstString(record, ["id", "playbook_id", "playbookId"]) ?? "unknown-playbook";
  const modifiedAt = firstString(record, ["modified", "modified_at", "updated", "updated_at"]);
  const workflowObjects = extractWorkflowObjects(record);
  const title = firstString(record, ["name", "title", "playbook_name"]) ?? id;
  const playbookTypes = arrayOfStrings(record.playbook_types);
  const playbookType = playbookTypes[0] ?? firstString(record, ["playbook_type", "category"]);

  return {
    id,
    cacaoId: id,
    title,
    description: firstString(record, ["description", "summary"]),
    summary: firstString(record, ["playbook_summary", "summary"]),
    author: extractAuthor(record),
    playbookType,
    labels: extractLabels(record),
    createdAt: firstString(record, ["created", "created_at"]),
    modifiedAt,
    versionLabel: `${id}${modifiedAt ? ` @ ${modifiedAt}` : ""}`,
    workflowStepCount: workflowObjects.length,
    hasManualSteps: hasManualStep(record),
    cacaoValidationStatus: extractValidationStatus(record),
    rawCacao
  };
}
