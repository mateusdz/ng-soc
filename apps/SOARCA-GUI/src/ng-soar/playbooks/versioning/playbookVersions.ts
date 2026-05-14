import { Playbook } from "@/types";

export type PlaybookVersionMetadata = {
  versionLabel: string;
  versionTimestamp?: string;
  parentIds: string[];
  isDerivedVersion: boolean;
  lineageLabel: string;
};

function shortId(value: string) {
  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
}

export function getPlaybookVersionMetadata(
  playbook: Playbook,
): PlaybookVersionMetadata {
  const parentIds = playbook.derived_from ?? [];
  const versionTimestamp = playbook.modified || playbook.created;
  const versionLabel = `${playbook.id}${versionTimestamp ? ` @ ${versionTimestamp}` : ""}`;
  const isDerivedVersion = parentIds.length > 0;

  return {
    versionLabel,
    versionTimestamp,
    parentIds,
    isDerivedVersion,
    lineageLabel: isDerivedVersion
      ? `Derived from ${parentIds.map(shortId).join(", ")}`
      : "Original playbook",
  };
}
