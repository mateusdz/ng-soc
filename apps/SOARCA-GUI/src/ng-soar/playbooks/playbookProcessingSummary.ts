import { Playbook, PlaybookProcessingSummary, Step } from "@/types";

type PlaybookProcessingSummaryKey = keyof PlaybookProcessingSummary;

export const playbookSummaryDefinitions: Array<{
  key: PlaybookProcessingSummaryKey;
  label: string;
  description: string;
}> = [
  {
    key: "manual_playbook",
    label: "Manual playbook",
    description: "Contains only manual commands and simple text-based tasks.",
  },
  {
    key: "external_playbooks",
    label: "External playbooks",
    description: "Calls another CACAO playbook through a playbook-action step.",
  },
  {
    key: "parallel_processing",
    label: "Parallel processing",
    description: "Uses parallel workflow branches.",
  },
  {
    key: "if_logic",
    label: "If logic",
    description: "Uses if-condition workflow logic.",
  },
  {
    key: "while_logic",
    label: "While logic",
    description: "Uses while-condition workflow logic.",
  },
  {
    key: "switch_logic",
    label: "Switch logic",
    description: "Uses switch-condition workflow logic.",
  },
  {
    key: "temporal_logic",
    label: "Temporal logic",
    description: "Uses delay or timeout workflow properties.",
  },
  {
    key: "data_markings",
    label: "Data markings",
    description: "References CACAO data marking objects.",
  },
  {
    key: "digital_signatures",
    label: "Digital signatures",
    description: "Contains digital signatures.",
  },
  {
    key: "countersigned_signatures",
    label: "Countersigned signatures",
    description: "Contains countersigned signature information.",
  },
  {
    key: "extensions",
    label: "Extensions",
    description: "Uses CACAO extensions.",
  },
];

export const playbookSummaryLabels = playbookSummaryDefinitions.reduce<
  Record<string, string>
>((labels, definition) => {
  labels[definition.key] = definition.label;
  return labels;
}, {});

function workflowSteps(playbook: Pick<Playbook, "workflow">) {
  return playbook.workflow ? Object.values(playbook.workflow) : [];
}

function recordCount(value?: Record<string, unknown>) {
  return value ? Object.keys(value).length : 0;
}

function containsText(value: unknown, pattern: RegExp): boolean {
  if (typeof value === "string") {
    return pattern.test(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsText(item, pattern));
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.entries(value).some(
    ([key, nested]) => pattern.test(key) || containsText(nested, pattern),
  );
}

function isStartOrEndStep(step: Step) {
  return /^(start|end)(?:-|_|\b)/i.test(step.type);
}

function isManualStep(step: Step) {
  const commands = step.commands;

  return (
    Boolean(commands?.length) &&
    commands?.every((command) => command.type === "manual")
  ) || containsText(step, /manual|human|user[-_ ]?input/i);
}

function hasExtensionUse(playbook: Playbook) {
  return (
    recordCount(playbook.extension_definitions) > 0 ||
    recordCount(playbook.playbook_extensions) > 0 ||
    workflowSteps(playbook).some((step) => recordCount(step.step_extensions) > 0)
  );
}

function hasCountersignature(value: unknown): boolean {
  return containsText(value, /countersign|counter[-_ ]?signature/i);
}

function compactSummary(
  summary: PlaybookProcessingSummary,
): PlaybookProcessingSummary | undefined {
  const entries = playbookSummaryDefinitions
    .filter(({ key }) => summary[key] === true)
    .map(({ key }) => [key, true] as const);

  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function detectPlaybookProcessingSummary(
  playbook: Playbook,
): Required<PlaybookProcessingSummary> {
  const steps = workflowSteps(playbook);
  const processingSteps = steps.filter((step) => !isStartOrEndStep(step));

  return {
    manual_playbook:
      processingSteps.length > 0 && processingSteps.every(isManualStep),
    external_playbooks: steps.some(
      (step) => Boolean(step.playbook_id) || step.type === "playbook-action",
    ),
    parallel_processing: steps.some(
      (step) =>
        /parallel/i.test(step.type) ||
        Boolean(step.next_steps && step.next_steps.length > 1),
    ),
    if_logic: steps.some(
      (step) =>
        /if/i.test(step.type) ||
        Boolean(step.condition || step.on_true || step.on_false),
    ),
    while_logic: steps.some((step) => /while/i.test(step.type)),
    switch_logic: steps.some(
      (step) => /switch/i.test(step.type) || Boolean(step.switch || step.cases),
    ),
    temporal_logic: steps.some((step) => Boolean(step.delay || step.timeout)),
    data_markings:
      Boolean(playbook.markings?.length) ||
      recordCount(playbook.data_marking_definitions) > 0,
    digital_signatures: Boolean(playbook.signatures?.length),
    countersigned_signatures: hasCountersignature(playbook.signatures),
    extensions: hasExtensionUse(playbook),
  };
}

export function inferPlaybookProcessingSummary(playbook: Playbook) {
  return compactSummary(detectPlaybookProcessingSummary(playbook));
}

export function ensurePlaybookProcessingSummary<T extends Playbook>(playbook: T): T {
  const inferred = inferPlaybookProcessingSummary(playbook) ?? {};
  const existing = compactSummary(playbook.playbook_processing_summary ?? {}) ?? {};
  const summary = {
    ...existing,
    ...inferred,
  };

  if (Object.keys(summary).length === 0) {
    return {
      ...playbook,
      playbook_processing_summary: undefined,
    };
  }

  return {
    ...playbook,
    playbook_processing_summary: summary,
  };
}

export function getPlaybookSummaryFeatures(playbook: Playbook) {
  const summary = playbook.playbook_processing_summary;

  if (!summary) {
    return [];
  }

  return Object.entries(summary)
    .filter(([, value]) => value === true)
    .map(([key]) => playbookSummaryLabels[key] ?? key.replaceAll("_", " "));
}

export function hasPlaybookProcessingSummary(playbook: Playbook) {
  return Boolean(
    playbook.playbook_processing_summary &&
      Object.values(playbook.playbook_processing_summary).some((value) => value === true),
  );
}
