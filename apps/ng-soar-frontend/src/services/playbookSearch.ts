import type { PlaybookCard } from "../types/playbook";

export type PlaybookFilters = {
  query: string;
  searchMode: "contains" | "exact";
  view: string;
  author: string;
  playbookType: string;
  label: string;
  validationStatus: string;
  manualStep: string;
  modifiedFrom: string;
  modifiedTo: string;
};

export const savedViews = [
  "All playbooks",
  "Valid playbooks",
  "Invalid playbooks",
  "Manual-step playbooks",
  "Recently modified"
];

function searchableText(playbook: PlaybookCard) {
  return [
    playbook.title,
    playbook.description,
    playbook.summary,
    playbook.author,
    playbook.playbookType,
    playbook.labels.join(" "),
    playbook.modifiedAt,
    playbook.createdAt,
    playbook.versionLabel,
    JSON.stringify(playbook.rawCacao)
  ]
    .join(" ")
    .toLowerCase();
}

function exactFields(playbook: PlaybookCard) {
  return [
    playbook.id,
    playbook.cacaoId,
    playbook.title,
    playbook.description,
    playbook.summary,
    playbook.author,
    playbook.playbookType,
    playbook.modifiedAt,
    playbook.versionLabel,
    ...playbook.labels
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
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

export function filterPlaybooks(playbooks: PlaybookCard[], filters: PlaybookFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = playbooks.filter((playbook) => {
    const matchesView =
      filters.view === "All playbooks" ||
      (filters.view === "Valid playbooks" && playbook.cacaoValidationStatus === "valid") ||
      (filters.view === "Invalid playbooks" && playbook.cacaoValidationStatus === "invalid") ||
      (filters.view === "Manual-step playbooks" && playbook.hasManualSteps) ||
      filters.view === "Recently modified";

    const matchesAuthor = !filters.author || playbook.author === filters.author;
    const matchesType = !filters.playbookType || playbook.playbookType === filters.playbookType;
    const matchesLabel = !filters.label || playbook.labels.includes(filters.label);
    const matchesValidation =
      !filters.validationStatus || playbook.cacaoValidationStatus === filters.validationStatus;
    const matchesManual =
      !filters.manualStep ||
      (filters.manualStep === "yes" && playbook.hasManualSteps) ||
      (filters.manualStep === "no" && !playbook.hasManualSteps);
    const matchesModifiedFrom = isOnOrAfter(playbook.modifiedAt, filters.modifiedFrom);
    const matchesModifiedTo = isOnOrBefore(playbook.modifiedAt, filters.modifiedTo);
    const matchesQuery =
      !normalizedQuery ||
      (filters.searchMode === "exact"
        ? exactFields(playbook).includes(normalizedQuery)
        : searchableText(playbook).includes(normalizedQuery));

    return (
      matchesView &&
      matchesAuthor &&
      matchesType &&
      matchesLabel &&
      matchesValidation &&
      matchesManual &&
      matchesModifiedFrom &&
      matchesModifiedTo &&
      matchesQuery
    );
  });

  if (filters.view === "Recently modified") {
    return filtered.sort((a, b) => (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? ""));
  }

  return filtered;
}
