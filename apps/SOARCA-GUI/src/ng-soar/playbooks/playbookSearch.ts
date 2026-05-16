import { useMemo, useState } from "react";

import {
  ExecutionSummaryByPlaybook,
  ExecutionSummaryStatus,
} from "@/ng-soar/api/executionSummaries";
import {
  IdentityById,
  resolveIdentityName,
} from "@/ng-soar/api/identities";
import { executionStatusLabels } from "@/ng-soar/playbooks/executions/executionStatus";
import { getPlaybookSummaryFeatures } from "@/ng-soar/playbooks/playbookProcessingSummary";
import { getPlaybookVersionMetadata } from "@/ng-soar/playbooks/versioning/playbookVersions";
import { Playbook, Step } from "@/types";

export type SearchMode = "contains" | "exact";

export type PlaybookSavedView =
  | "all"
  | "manual"
  | "recently-modified"
  | "derived-versions";

export type PlaybookFilters = {
  query: string;
  searchMode: SearchMode;
  view: PlaybookSavedView;
  author: string;
  playbookType: string;
  manualStep: string;
  executionStatus: string;
};

export type PlaybookMetadata = {
  author?: string;
  authorName?: string;
  labels: string[];
  playbookType?: string;
  modifiedAt?: string;
  createdAt?: string;
  workflowStepCount: number;
  hasManualSteps: boolean;
  isDerivedVersion: boolean;
  versionParentIds: string[];
  versionLineageLabel: string;
  lastExecutionStatus?: ExecutionSummaryStatus;
  lastExecutionAt?: string;
  isValid: boolean;
  isExecutable: boolean;
  summaryFeatures: string[];
  versionLabel: string;
  searchableText: string;
  exactFields: string[];
};

export type PlaybookSearchRecord = {
  playbook: Playbook;
  metadata: PlaybookMetadata;
};

export type SelectOption = {
  label: string;
  value: string;
};

export const defaultPlaybookFilters: PlaybookFilters = {
  query: "",
  searchMode: "contains",
  view: "all",
  author: "",
  playbookType: "",
  manualStep: "",
  executionStatus: "",
};

export const savedViews: Array<{ label: string; value: PlaybookSavedView }> = [
  { label: "All", value: "all" },
  { label: "Manual steps", value: "manual" },
  { label: "Recently modified", value: "recently-modified" },
  { label: "Derived versions", value: "derived-versions" },
];

export const playbookTypeOptions = [
  { label: "Attack", value: "attack" },
  { label: "Detection", value: "detection" },
  { label: "Engagement", value: "engagement" },
  { label: "Investigation", value: "investigation" },
  { label: "Mitigation", value: "mitigation" },
  { label: "Notification", value: "notification" },
  { label: "Prevention", value: "prevention" },
  { label: "Remediation", value: "remediation" },
];

export const playbookTypeLabels = playbookTypeOptions.reduce<Record<string, string>>(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  {},
);

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function hasManualStep(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(hasManualStep);
  }

  if (!value || typeof value !== "object") {
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

function workflowSteps(workflow?: Record<string, Step>) {
  return workflow ? Object.values(workflow) : [];
}

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim()));
}

function isValidPlaybook(playbook: Playbook) {
  return Boolean(
    playbook.type === "playbook" &&
      playbook.id &&
      playbook.name &&
      playbook.spec_version &&
      playbook.workflow_start &&
      playbook.workflow &&
      typeof playbook.workflow === "object",
  );
}

function isExecutablePlaybook(playbook: Playbook) {
  return isValidPlaybook(playbook) && Boolean(playbook.workflow[playbook.workflow_start]);
}

export function extractPlaybookMetadata(
  playbook: Playbook,
  identitiesById: IdentityById = {},
): PlaybookMetadata {
  return extractPlaybookMetadataWithExecution(playbook, {}, identitiesById);
}

function extractPlaybookMetadataWithExecution(
  playbook: Playbook,
  summariesByPlaybook: ExecutionSummaryByPlaybook = {},
  identitiesById: IdentityById = {},
): PlaybookMetadata {
  const labels = playbook.labels ?? [];
  const playbookType = playbook.playbook_types?.[0];
  const author = playbook.created_by;
  const authorName = resolveIdentityName(author, identitiesById);
  const workflowStepCount = workflowSteps(playbook.workflow).length;
  const versionMetadata = getPlaybookVersionMetadata(playbook);
  const versionLabel = versionMetadata.versionLabel;
  const lastExecution = summariesByPlaybook[playbook.id];
  const lastExecutionStatus = lastExecution?.status;
  const lastExecutionAt =
    lastExecution?.completedAt ??
    lastExecution?.startedAt ??
    lastExecution?.updatedAt;
  const lastExecutionLabel = lastExecutionStatus
    ? executionStatusLabels[lastExecutionStatus]
    : undefined;
  const summaryFeatures = getPlaybookSummaryFeatures(playbook);
  const isValid = isValidPlaybook(playbook);
  const isExecutable = isExecutablePlaybook(playbook);

  const searchableText = [
    playbook.id,
    playbook.name,
    playbook.description,
    author,
    authorName,
    playbookType,
    labels.join(" "),
    playbook.created,
    playbook.modified,
    versionLabel,
    versionMetadata.lineageLabel,
    versionMetadata.parentIds.join(" "),
    lastExecutionStatus,
    lastExecutionLabel,
    lastExecutionAt,
    isValid ? "valid" : "invalid",
    isExecutable ? "executable" : "not executable",
    summaryFeatures.join(" "),
    JSON.stringify(playbook),
  ]
    .join(" ")
    .toLowerCase();

  const exactFields = compactStrings([
    playbook.id,
    playbook.name,
    playbook.description,
    author,
    authorName,
    playbookType,
    playbook.created,
    playbook.modified,
    versionLabel,
    versionMetadata.lineageLabel,
    ...versionMetadata.parentIds,
    lastExecutionStatus,
    lastExecutionLabel,
    isValid ? "valid" : "invalid",
    isExecutable ? "executable" : "not executable",
    ...summaryFeatures,
    ...labels,
  ]).map(normalize);

  return {
    author,
    authorName,
    labels,
    playbookType,
    modifiedAt: playbook.modified,
    createdAt: playbook.created,
    workflowStepCount,
    hasManualSteps: hasManualStep(playbook),
    isDerivedVersion: versionMetadata.isDerivedVersion,
    versionParentIds: versionMetadata.parentIds,
    versionLineageLabel: versionMetadata.lineageLabel,
    lastExecutionStatus,
    lastExecutionAt,
    isValid,
    isExecutable,
    summaryFeatures,
    versionLabel,
    searchableText,
    exactFields,
  };
}

function createSearchRecords(
  playbooks: Playbook[],
  summariesByPlaybook: ExecutionSummaryByPlaybook,
  identitiesById: IdentityById,
): PlaybookSearchRecord[] {
  return playbooks.map((playbook) => ({
    playbook,
    metadata: extractPlaybookMetadataWithExecution(
      playbook,
      summariesByPlaybook,
      identitiesById,
    ),
  }));
}

function distinctSelectOptions(records: SelectOption[]) {
  const optionsByValue = new Map<string, SelectOption>();

  for (const record of records) {
    if (!record.value.trim()) {
      continue;
    }

    optionsByValue.set(record.value, record);
  }

  return Array.from(optionsByValue.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
}

function filterPlaybooks(records: PlaybookSearchRecord[], filters: PlaybookFilters) {
  const query = normalize(filters.query);

  const filtered = records.filter(({ metadata }) => {
    const matchesView =
      filters.view === "all" ||
      (filters.view === "manual" && metadata.hasManualSteps) ||
      filters.view === "recently-modified" ||
      (filters.view === "derived-versions" && metadata.isDerivedVersion);

    const matchesAuthor = !filters.author || metadata.author === filters.author;
    const matchesType =
      !filters.playbookType ||
      normalize(metadata.playbookType) === filters.playbookType;
    const matchesManual =
      !filters.manualStep ||
      (filters.manualStep === "yes" && metadata.hasManualSteps) ||
      (filters.manualStep === "no" && !metadata.hasManualSteps);
    const matchesExecutionStatus =
      !filters.executionStatus ||
      metadata.lastExecutionStatus === filters.executionStatus;
    const matchesQuery =
      !query ||
      (filters.searchMode === "exact"
        ? metadata.exactFields.includes(query)
        : metadata.searchableText.includes(query));

    return (
      matchesView &&
      matchesAuthor &&
      matchesType &&
      matchesManual &&
      matchesExecutionStatus &&
      matchesQuery
    );
  });

  if (filters.view === "recently-modified") {
    return filtered.sort((a, b) => (b.metadata.modifiedAt ?? "").localeCompare(a.metadata.modifiedAt ?? ""));
  }

  return filtered;
}

export function useNgSoarPlaybookSearch(
  playbooks: Playbook[],
  summariesByPlaybook: ExecutionSummaryByPlaybook = {},
  identitiesById: IdentityById = {},
) {
  const [filters, setFilters] = useState<PlaybookFilters>(defaultPlaybookFilters);

  const searchRecords = useMemo(
    () => createSearchRecords(playbooks, summariesByPlaybook, identitiesById),
    [playbooks, summariesByPlaybook, identitiesById],
  );
  const filteredRecords = useMemo(
    () => filterPlaybooks(searchRecords, filters),
    [searchRecords, filters],
  );
  const sortedRecords = useMemo(() => {
    if (filters.view === "recently-modified") {
      return filteredRecords;
    }

    return [...filteredRecords].sort((a, b) =>
      (a.playbook.name || "").localeCompare(b.playbook.name || "", undefined, {
        sensitivity: "base",
      }),
    );
  }, [filteredRecords, filters.view]);

  const authorOptions = useMemo(
    () =>
      distinctSelectOptions(
        searchRecords.map((record) => ({
          label: record.metadata.authorName ?? "Unknown author",
          value: record.metadata.author ?? "",
        })),
      ),
    [searchRecords],
  );
  const setFilter = (key: keyof PlaybookFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return {
    authorOptions,
    filters,
    resetFilters: () => setFilters(defaultPlaybookFilters),
    searchRecords,
    setFilter,
    sortedRecords,
    typeOptions: playbookTypeOptions,
  };
}
