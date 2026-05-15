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
  label: string;
  manualStep: string;
  executionStatus: string;
  modifiedFrom: string;
  modifiedTo: string;
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
  label: "",
  manualStep: "",
  executionStatus: "",
  modifiedFrom: "",
  modifiedTo: "",
};

export const savedViews: Array<{ label: string; value: PlaybookSavedView }> = [
  { label: "All", value: "all" },
  { label: "Manual steps", value: "manual" },
  { label: "Recently modified", value: "recently-modified" },
  { label: "Derived versions", value: "derived-versions" },
];

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

function isOnOrAfter(value: string | undefined, boundary: string) {
  if (!value || !boundary) {
    return true;
  }

  return value.slice(0, 10) >= boundary;
}

function isOnOrBefore(value: string | undefined, boundary: string) {
  if (!value || !boundary) {
    return true;
  }

  return value.slice(0, 10) <= boundary;
}

function compactStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim()));
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

function distinctOptions(values: Array<string | undefined>) {
  return Array.from(new Set(compactStrings(values))).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
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
    const matchesType = !filters.playbookType || metadata.playbookType === filters.playbookType;
    const matchesLabel = !filters.label || metadata.labels.includes(filters.label);
    const matchesManual =
      !filters.manualStep ||
      (filters.manualStep === "yes" && metadata.hasManualSteps) ||
      (filters.manualStep === "no" && !metadata.hasManualSteps);
    const matchesExecutionStatus =
      !filters.executionStatus ||
      metadata.lastExecutionStatus === filters.executionStatus;
    const matchesModifiedFrom = isOnOrAfter(metadata.modifiedAt, filters.modifiedFrom);
    const matchesModifiedTo = isOnOrBefore(metadata.modifiedAt, filters.modifiedTo);
    const matchesQuery =
      !query ||
      (filters.searchMode === "exact"
        ? metadata.exactFields.includes(query)
        : metadata.searchableText.includes(query));

    return (
      matchesView &&
      matchesAuthor &&
      matchesType &&
      matchesLabel &&
      matchesManual &&
      matchesExecutionStatus &&
      matchesModifiedFrom &&
      matchesModifiedTo &&
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
          label: record.metadata.authorName ?? record.metadata.author ?? "Unknown author",
          value: record.metadata.author ?? "",
        })),
      ),
    [searchRecords],
  );
  const typeOptions = useMemo(
    () => distinctOptions(searchRecords.map((record) => record.metadata.playbookType)),
    [searchRecords],
  );
  const labelOptions = useMemo(
    () => distinctOptions(searchRecords.flatMap((record) => record.metadata.labels)),
    [searchRecords],
  );

  const setFilter = (key: keyof PlaybookFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return {
    authorOptions,
    filters,
    labelOptions,
    resetFilters: () => setFilters(defaultPlaybookFilters),
    searchRecords,
    setFilter,
    sortedRecords,
    typeOptions,
  };
}
