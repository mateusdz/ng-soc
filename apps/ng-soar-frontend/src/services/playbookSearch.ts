import type { PlaybookCard } from "../types/playbook";

export type PlaybookFilters = {
  query: string;
  view: string;
  author: string;
  playbookType: string;
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
    JSON.stringify(playbook.rawCacao)
  ]
    .join(" ")
    .toLowerCase();
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
    const matchesQuery = !normalizedQuery || searchableText(playbook).includes(normalizedQuery);

    return matchesView && matchesAuthor && matchesType && matchesQuery;
  });

  if (filters.view === "Recently modified") {
    return filtered.sort((a, b) => (b.modifiedAt ?? "").localeCompare(a.modifiedAt ?? ""));
  }

  return filtered;
}
