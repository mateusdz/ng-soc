import type { PlaybookCard } from "../types/playbook";

export const mockPlaybooks: PlaybookCard[] = [
  {
    id: "playbook--contain-phishing-001",
    cacaoId: "playbook--contain-phishing-001",
    title: "Phishing Containment",
    description:
      "Triage reported phishing, collect mailbox evidence, isolate indicators, and notify the analyst for manual approval.",
    summary: "Mailbox triage and containment with one manual analyst checkpoint.",
    author: "NG-SOC Playbook Engineering",
    playbookType: "incident-response",
    labels: ["phishing", "email", "containment"],
    createdAt: "2026-04-08T09:30:00Z",
    modifiedAt: "2026-05-06T14:10:00Z",
    versionLabel: "playbook--contain-phishing-001 @ 2026-05-06T14:10:00Z",
    workflowStepCount: 7,
    hasManualSteps: true,
    cacaoValidationStatus: "valid",
    lastExecutionStatus: "await_user_input",
    lastExecutionAt: "2026-05-11T12:45:00Z",
    rawCacao: {
      id: "playbook--contain-phishing-001",
      name: "Phishing Containment",
      workflow: {
        start: { type: "start" },
        analyst_approval: { type: "manual" }
      }
    }
  },
  {
    id: "playbook--suspicious-host-002",
    cacaoId: "playbook--suspicious-host-002",
    title: "Suspicious Host Investigation",
    description:
      "Gather host telemetry, enrich network indicators, and prepare response notes for escalation.",
    summary: "Endpoint and network enrichment flow for suspicious hosts.",
    author: "SOC Automation Team",
    playbookType: "investigation",
    labels: ["endpoint", "network", "triage"],
    createdAt: "2026-03-18T11:00:00Z",
    modifiedAt: "2026-05-02T16:25:00Z",
    versionLabel: "playbook--suspicious-host-002 @ 2026-05-02T16:25:00Z",
    workflowStepCount: 9,
    hasManualSteps: false,
    cacaoValidationStatus: "valid",
    lastExecutionStatus: "successfully_executed",
    lastExecutionAt: "2026-05-10T08:20:00Z",
    rawCacao: {
      id: "playbook--suspicious-host-002",
      name: "Suspicious Host Investigation",
      workflow: {
        start: { type: "start" },
        enrich: { type: "action" }
      }
    }
  },
  {
    id: "playbook--credential-reset-003",
    cacaoId: "playbook--credential-reset-003",
    title: "Credential Reset Support",
    description:
      "Draft response actions for suspected account compromise. This mock item intentionally shows an invalid validation state.",
    summary: "Account compromise support with a validation issue.",
    author: "Identity Response",
    playbookType: "response",
    labels: ["identity", "credentials", "support"],
    createdAt: "2026-02-21T10:15:00Z",
    modifiedAt: "2026-04-28T09:55:00Z",
    versionLabel: "playbook--credential-reset-003 @ 2026-04-28T09:55:00Z",
    workflowStepCount: 5,
    hasManualSteps: true,
    cacaoValidationStatus: "invalid",
    lastExecutionStatus: "unknown",
    rawCacao: {
      id: "playbook--credential-reset-003",
      name: "Credential Reset Support",
      workflow: {
        manual_reset: { type: "manual" }
      }
    }
  }
];
