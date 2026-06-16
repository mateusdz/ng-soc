import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FilePlusCorner,
  Hand,
  Play,
  ShieldCheck,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { getPlaybooks } from "@/api/playbooks";
import { getReporterState } from "@/api/reporter";
import { getSystemStatus } from "@/api/status";
import {
  Badge,
  Button,
  CardContainer,
  CardHeader,
  CardTitle,
  Icon,
  SuspenseCard,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import {
  getExecutionSummaries,
  type ExecutionSummary,
  type ExecutionSummaryStatus,
} from "@/ng-soar/api/executionSummaries";
import {
  executionStatusLabels,
  executionStatusVariant,
} from "@/ng-soar/playbooks/executions/executionStatus";
import { extractPlaybookMetadata } from "@/ng-soar/playbooks/playbookSearch";
import { Playbook, PlaybookExecutionReport } from "@/types";
import {
  computeDurationMs,
  formatDateTime,
  formatDuration,
  PATHS,
} from "@/utils";

import {
  CardContentStack,
  DashboardGrid,
  DashboardHeaderActions,
  DashboardLayout,
  DashboardList,
  DashboardListItem,
  DashboardListMain,
  DashboardListMeta,
  DashboardListTitle,
  EmptyState,
  MetricCaption,
  MetricCard,
  MetricCardBody,
  MetricHeader,
  MetricLabel,
  MetricsGrid,
  MetricValue,
  StatusLabel,
  StatusRow,
  StatusRows,
  StatusValue,
} from "./DashboardPage.styles";

type DashboardMetric = {
  label: string;
  value: string | number;
  caption: string;
  icon: LucideIcon;
  variant: ThemeVariant;
};

type AttentionItem = {
  id: string;
  title: string;
  meta: string;
  badge: string;
  variant: ThemeVariant;
  target: string;
};

const ERROR_STATUSES: ExecutionSummaryStatus[] = [
  "failed",
  "server_side_error",
  "client_side_error",
  "timeout_error",
  "exception_condition_error",
];

const LONG_RUNNING_THRESHOLD_MS = 30 * 60 * 1000;

function latestTimestamp(summary: ExecutionSummary) {
  return (
    summary.completedAt ??
    summary.startedAt ??
    summary.updatedAt ??
    summary.createdAt ??
    ""
  );
}

function isErrorStatus(status?: ExecutionSummaryStatus) {
  return Boolean(status && ERROR_STATUSES.includes(status));
}

function timestampMs(value?: string) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? undefined : parsed;
}

function isWithinDays(value: string | undefined, days: number) {
  const time = timestampMs(value);

  if (!time) {
    return false;
  }

  return Date.now() - time <= days * 24 * 60 * 60 * 1000;
}

function sortExecutionsByLatest(summaries: ExecutionSummary[]) {
  return [...summaries].sort((a, b) =>
    latestTimestamp(b).localeCompare(latestTimestamp(a)),
  );
}

function hasManualActionRequired(report: PlaybookExecutionReport) {
  return Object.values(report.step_results ?? {}).some(
    (step) => step.automated_execution === false && step.status === "ongoing",
  );
}

function manualStepCount(report: PlaybookExecutionReport) {
  return Object.values(report.step_results ?? {}).filter(
    (step) => step.automated_execution === false && step.status === "ongoing",
  ).length;
}

function isLongRunning(report: PlaybookExecutionReport) {
  if (report.status !== "ongoing") {
    return false;
  }

  const started = timestampMs(report.started);

  return Boolean(started && Date.now() - started > LONG_RUNNING_THRESHOLD_MS);
}

function playbookDetailPath(playbookId: string) {
  return PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);
}

function monitoringDetailPath(executionId: string) {
  return PATHS.MONITORING.DETAIL.replace(":executionId", executionId);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${Math.round(value)}%`;
}

function averageDuration(summaries: ExecutionSummary[]) {
  const durations = summaries
    .map((summary) => summary.durationMs)
    .filter((duration): duration is number => typeof duration === "number");

  if (!durations.length) {
    return undefined;
  }

  return durations.reduce((total, duration) => total + duration, 0) / durations.length;
}

function MetricTile({ metric }: { metric: DashboardMetric }) {
  return (
    <MetricCard>
      <MetricCardBody>
        <MetricHeader>
          <MetricLabel>{metric.label}</MetricLabel>
          <Icon
            $icon={metric.icon}
            $size={ThemeSize.ExtraLarge}
            $variant={metric.variant}
            $round
          />
        </MetricHeader>
        <MetricValue>{metric.value}</MetricValue>
        <MetricCaption>{metric.caption}</MetricCaption>
      </MetricCardBody>
    </MetricCard>
  );
}

export const NgSoarDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const playbooksQuery = useQuery({
    queryKey: ["playbooks"],
    queryFn: getPlaybooks,
    refetchOnWindowFocus: false,
  });
  const executionsQuery = useQuery({
    queryKey: ["ng-soar-execution-summaries"],
    queryFn: getExecutionSummaries,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const reporterQuery = useQuery({
    queryKey: ["monitoring"],
    queryFn: getReporterState,
    refetchInterval: (_, query) => (query.state.error ? 10000 : 5000),
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const systemStatusQuery = useQuery({
    queryKey: ["system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const playbooks = playbooksQuery.data ?? [];
  const executionSummaries = executionsQuery.data ?? [];
  const reporterState = reporterQuery.data ?? [];
  const playbookRecords = React.useMemo(
    () =>
      playbooks.map((playbook) => ({
        playbook,
        metadata: extractPlaybookMetadata(playbook),
      })),
    [playbooks],
  );
  const sortedExecutions = React.useMemo(
    () => sortExecutionsByLatest(executionSummaries),
    [executionSummaries],
  );
  const recentProblemExecutions = React.useMemo(
    () =>
      sortedExecutions
        .filter(
          (summary) =>
            isErrorStatus(summary.status) ||
            summary.status === "await_user_input" ||
            summary.status === "ongoing",
        )
        .slice(0, 5),
    [sortedExecutions],
  );

  const manualReports = reporterState.filter(hasManualActionRequired);
  const longRunningReports = reporterState.filter(isLongRunning);
  const runningExecutions =
    executionSummaries.filter((summary) => summary.status === "ongoing").length +
    reporterState.filter((report) => report.status === "ongoing").length;
  const failedLastSevenDays = executionSummaries.filter(
    (summary) =>
      isErrorStatus(summary.status) && isWithinDays(latestTimestamp(summary), 7),
  ).length;
  const successfulExecutions = executionSummaries.filter(
    (summary) => summary.status === "successfully_executed",
  ).length;
  const successRate = executionSummaries.length
    ? (successfulExecutions / executionSummaries.length) * 100
    : 0;
  const avgDuration = averageDuration(executionSummaries);

  const readyPlaybooks = playbookRecords.filter(
    ({ metadata }) => metadata.isValid && metadata.isExecutable,
  ).length;
  const invalidPlaybooks = playbookRecords.filter(
    ({ metadata }) => !metadata.isValid,
  ).length;
  const nonExecutablePlaybooks = playbookRecords.filter(
    ({ metadata }) => metadata.isValid && !metadata.isExecutable,
  ).length;
  const missingSummaryPlaybooks = playbookRecords.filter(
    ({ metadata }) => metadata.summaryFeatures.length === 0,
  ).length;
  const highImpactPlaybooks = playbooks.filter(
    (playbook) =>
      (playbook.impact ?? 0) >= 70 ||
      (playbook.severity ?? 0) >= 70 ||
      (playbook.priority ?? 101) <= 10,
  ).length;
  const manualPlaybooks = playbookRecords.filter(
    ({ metadata }) => metadata.hasManualSteps,
  ).length;
  const manualOnlyPlaybooks = playbooks.filter(
    (playbook) => playbook.playbook_processing_summary?.manual_playbook,
  ).length;

  const playbookTypeCounts = playbooks.reduce<Record<string, number>>(
    (counts, playbook) => {
      for (const type of playbook.playbook_types ?? ["Unclassified"]) {
        counts[type] = (counts[type] ?? 0) + 1;
      }

      return counts;
    },
    {},
  );

  const attentionItems: AttentionItem[] = [
    ...manualReports.map((report) => ({
      id: `manual-${report.execution_id}`,
      title: report.name || report.playbook_id,
      meta: `${manualStepCount(report)} manual step${manualStepCount(report) === 1 ? "" : "s"} waiting since ${formatDateTime(report.started, true)}`,
      badge: "Manual input",
      variant: ThemeVariant.Warning,
      target: monitoringDetailPath(report.execution_id),
    })),
    ...longRunningReports.map((report) => ({
      id: `long-${report.execution_id}`,
      title: report.name || report.playbook_id,
      meta: `Running for ${formatDuration(computeDurationMs(report.started, undefined))}`,
      badge: "Long running",
      variant: ThemeVariant.Warning,
      target: monitoringDetailPath(report.execution_id),
    })),
    ...sortedExecutions
      .filter((summary) => isErrorStatus(summary.status))
      .slice(0, 4)
      .map((summary) => ({
        id: `failed-${summary.id}`,
        title: summary.playbookId,
        meta: `${executionStatusLabels[summary.status]} at ${formatDateTime(latestTimestamp(summary), true)}`,
        badge: "Failed",
        variant: ThemeVariant.Error,
        target: summary.executionId
          ? monitoringDetailPath(summary.executionId)
          : PATHS.MONITORING.BASE,
      })),
    ...playbookRecords
      .filter(({ metadata }) => !metadata.isValid || !metadata.isExecutable)
      .slice(0, 4)
      .map(({ playbook, metadata }) => ({
        id: `readiness-${playbook.id}`,
        title: playbook.name,
        meta: metadata.isValid
          ? "Valid metadata, but not executable"
          : "Invalid CACAO metadata",
        badge: metadata.isValid ? "Not executable" : "Invalid",
        variant: ThemeVariant.Error,
        target: playbookDetailPath(playbook.id),
      })),
  ].slice(0, 7);

  const metrics: DashboardMetric[] = [
    {
      label: "Attention required",
      value: attentionItems.length,
      caption: `${manualReports.length} manual, ${failedLastSevenDays} failed in 7d`,
      icon: AlertTriangle,
      variant: attentionItems.length ? ThemeVariant.Warning : ThemeVariant.Success,
    },
    {
      label: "Execution health",
      value: formatPercent(successRate),
      caption: `${runningExecutions} running, avg ${avgDuration ? formatDuration(avgDuration) : "n/a"}`,
      icon: Activity,
      variant: failedLastSevenDays ? ThemeVariant.Warning : ThemeVariant.Success,
    },
    {
      label: "Playbook readiness",
      value: `${readyPlaybooks}/${playbooks.length}`,
      caption: `${invalidPlaybooks + nonExecutablePlaybooks} not ready, ${missingSummaryPlaybooks} missing summary`,
      icon: CheckCircle2,
      variant:
        invalidPlaybooks || nonExecutablePlaybooks
          ? ThemeVariant.Warning
          : ThemeVariant.Success,
    },
    {
      label: "Manual workload",
      value: manualReports.reduce((total, report) => total + manualStepCount(report), 0),
      caption: `${manualPlaybooks} playbooks use manual steps`,
      icon: Hand,
      variant: manualReports.length ? ThemeVariant.Warning : ThemeVariant.Info,
    },
  ];

  const systemStatusVariant = systemStatusQuery.isError
    ? ThemeVariant.Error
    : systemStatusQuery.isLoading
      ? ThemeVariant.Info
      : ThemeVariant.Success;
  const systemStatusLabel = systemStatusQuery.isError
    ? "Offline"
    : systemStatusQuery.isLoading
      ? "Checking"
      : "Online";

  return (
    <SuspenseCard
      $isLoading={playbooksQuery.isLoading}
      $isError={playbooksQuery.isError}
      $errorMessage="The dashboard could not load playbooks from SOARCA."
    >
      <DashboardLayout>
        <CardContainer>
          <CardHeader>
            <div>
              <CardTitle>SOC operations overview</CardTitle>
              <Text>
                Analyst attention, automation health, and playbook readiness.
              </Text>
            </div>
            <DashboardHeaderActions>
              <Button
                type="button"
                $variant={ThemeVariant.Primary}
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.MONITORING.BASE)}
              >
                <Icon $icon={Play} $size={ThemeSize.Medium} />
                Monitoring
              </Button>
              <Button
                type="button"
                $variant={ThemeVariant.Secondary}
                $ghost
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.ROASTER.BASE)}
              >
                <Icon $icon={SquareTerminal} $size={ThemeSize.Medium} />
                Playbook Editor
              </Button>
            </DashboardHeaderActions>
          </CardHeader>
        </CardContainer>

        <MetricsGrid>
          {metrics.map((metric) => (
            <MetricTile key={metric.label} metric={metric} />
          ))}
        </MetricsGrid>

        <DashboardGrid>
          <CardContainer>
            <CardHeader>
              <CardTitle>Analyst action queue</CardTitle>
              <Badge $variant={attentionItems.length ? ThemeVariant.Warning : ThemeVariant.Success}>
                {attentionItems.length ? "Needs review" : "Clear"}
              </Badge>
            </CardHeader>
            <CardContentStack>
              {attentionItems.length ? (
                <DashboardList>
                  {attentionItems.map((item) => (
                    <DashboardListItem
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.target)}
                    >
                      <DashboardListMain>
                        <DashboardListTitle>{item.title}</DashboardListTitle>
                        <DashboardListMeta>{item.meta}</DashboardListMeta>
                      </DashboardListMain>
                      <Badge $variant={item.variant}>{item.badge}</Badge>
                    </DashboardListItem>
                  ))}
                </DashboardList>
              ) : (
                <EmptyState>No failed, blocked, or waiting automation needs attention.</EmptyState>
              )}
            </CardContentStack>
          </CardContainer>

          <CardContainer>
            <CardHeader>
              <CardTitle>Execution health</CardTitle>
              <Icon $icon={Activity} $size={ThemeSize.ExtraLarge} />
            </CardHeader>
            <CardContentStack>
              <StatusRows>
                <StatusRow>
                  <StatusLabel>Success rate</StatusLabel>
                  <StatusValue>{formatPercent(successRate)}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Running now</StatusLabel>
                  <StatusValue>{runningExecutions}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Failed in last 7 days</StatusLabel>
                  <StatusValue>{failedLastSevenDays}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Average duration</StatusLabel>
                  <StatusValue>
                    {avgDuration ? formatDuration(avgDuration) : "No duration data"}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Manual steps waiting</StatusLabel>
                  <StatusValue>
                    {manualReports.reduce(
                      (total, report) => total + manualStepCount(report),
                      0,
                    )}
                  </StatusValue>
                </StatusRow>
              </StatusRows>
            </CardContentStack>
          </CardContainer>
        </DashboardGrid>

        <DashboardGrid>
          <CardContainer>
            <CardHeader>
              <CardTitle>Playbook readiness</CardTitle>
              <Button
                type="button"
                $variant={ThemeVariant.Primary}
                $ghost
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
              >
                View library
              </Button>
            </CardHeader>
            <CardContentStack>
              <StatusRows>
                <StatusRow>
                  <StatusLabel>Valid and executable</StatusLabel>
                  <StatusValue>{readyPlaybooks}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Invalid metadata</StatusLabel>
                  <StatusValue>{invalidPlaybooks}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Valid but not executable</StatusLabel>
                  <StatusValue>{nonExecutablePlaybooks}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>High impact / severity / priority</StatusLabel>
                  <StatusValue>{highImpactPlaybooks}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Missing processing summary</StatusLabel>
                  <StatusValue>{missingSummaryPlaybooks}</StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Manual-only playbooks</StatusLabel>
                  <StatusValue>{manualOnlyPlaybooks}</StatusValue>
                </StatusRow>
              </StatusRows>
            </CardContentStack>
          </CardContainer>

          <CardContainer>
            <CardHeader>
              <CardTitle>Automation coverage</CardTitle>
              <Icon $icon={ShieldCheck} $size={ThemeSize.ExtraLarge} />
            </CardHeader>
            <CardContentStack>
              {Object.keys(playbookTypeCounts).length ? (
                <StatusRows>
                  {Object.entries(playbookTypeCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <StatusRow key={type}>
                        <StatusLabel>{type}</StatusLabel>
                        <StatusValue>{count}</StatusValue>
                      </StatusRow>
                    ))}
                </StatusRows>
              ) : (
                <EmptyState>No playbook type coverage available.</EmptyState>
              )}
            </CardContentStack>
          </CardContainer>
        </DashboardGrid>

        <DashboardGrid>
          <CardContainer>
            <CardHeader>
              <CardTitle>Recent execution problems</CardTitle>
              <Button
                type="button"
                $variant={ThemeVariant.Primary}
                $ghost
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.MONITORING.BASE)}
              >
                Monitoring
              </Button>
            </CardHeader>
            <CardContentStack>
              {recentProblemExecutions.length ? (
                <DashboardList>
                  {recentProblemExecutions.map((summary) => (
                    <DashboardListItem
                      key={summary.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          summary.executionId
                            ? monitoringDetailPath(summary.executionId)
                            : PATHS.MONITORING.BASE,
                        )
                      }
                    >
                      <DashboardListMain>
                        <DashboardListTitle>{summary.playbookId}</DashboardListTitle>
                        <DashboardListMeta>
                          {formatDateTime(latestTimestamp(summary), true)}
                        </DashboardListMeta>
                      </DashboardListMain>
                      <Badge $variant={executionStatusVariant(summary.status)}>
                        {executionStatusLabels[summary.status]}
                      </Badge>
                    </DashboardListItem>
                  ))}
                </DashboardList>
              ) : (
                <EmptyState>No failed, waiting, or running executions found.</EmptyState>
              )}
            </CardContentStack>
          </CardContainer>

          <CardContainer>
            <CardHeader>
              <CardTitle>Platform health</CardTitle>
              <Badge $variant={systemStatusVariant}>{systemStatusLabel}</Badge>
            </CardHeader>
            <CardContentStack>
              <StatusRows>
                <StatusRow>
                  <StatusLabel>SOARCA runtime</StatusLabel>
                  <StatusValue>
                    {systemStatusQuery.data?.runtime ?? "Unavailable"}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>SOARCA version</StatusLabel>
                  <StatusValue>
                    {systemStatusQuery.data?.version ?? "Unavailable"}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>SOARCA uptime</StatusLabel>
                  <StatusValue>
                    {formatDuration(systemStatusQuery.data?.uptime?.milliseconds)}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Persisted execution records</StatusLabel>
                  <StatusValue>{executionSummaries.length}</StatusValue>
                </StatusRow>
              </StatusRows>
            </CardContentStack>
          </CardContainer>
        </DashboardGrid>
      </DashboardLayout>
    </SuspenseCard>
  );
};
