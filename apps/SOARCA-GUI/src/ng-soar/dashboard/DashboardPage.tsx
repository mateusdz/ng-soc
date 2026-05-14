import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Clock3,
  FilePlusCorner,
  GitBranch,
  Hand,
  type LucideIcon,
  Play,
  RefreshCw,
  ShieldCheck,
  SquareTerminal,
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

function latestTimestamp(summary: ExecutionSummary) {
  return (
    summary.completedAt ??
    summary.startedAt ??
    summary.updatedAt ??
    summary.createdAt ??
    ""
  );
}

function sortPlaybooksByModified(playbooks: Playbook[]) {
  return [...playbooks].sort((a, b) =>
    (b.modified ?? b.created ?? "").localeCompare(a.modified ?? a.created ?? ""),
  );
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

function playbookDetailPath(playbookId: string) {
  return PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);
}

function monitoringDetailPath(executionId: string) {
  return PATHS.MONITORING.DETAIL.replace(":executionId", executionId);
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
  const recentPlaybooks = React.useMemo(
    () => sortPlaybooksByModified(playbooks).slice(0, 5),
    [playbooks],
  );
  const recentExecutions = React.useMemo(
    () => sortExecutionsByLatest(executionSummaries).slice(0, 5),
    [executionSummaries],
  );

  const manualPlaybooks = playbookRecords.filter(
    ({ metadata }) => metadata.hasManualSteps,
  ).length;
  const derivedVersions = playbookRecords.filter(
    ({ metadata }) => metadata.isDerivedVersion,
  ).length;
  const successfulExecutions = executionSummaries.filter(
    (summary) => summary.status === "successfully_executed",
  ).length;
  const ongoingExecutions =
    executionSummaries.filter((summary) => summary.status === "ongoing").length +
    reporterState.filter((report) => report.status === "ongoing").length;
  const manualActions = reporterState.filter(hasManualActionRequired).length;

  const latestExecution = recentExecutions[0];
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
  const metrics: DashboardMetric[] = [
    {
      label: "Playbooks",
      value: playbooks.length,
      caption: `${manualPlaybooks} with manual steps`,
      icon: BookOpen,
      variant: ThemeVariant.Primary,
    },
    {
      label: "Derived versions",
      value: derivedVersions,
      caption: "Tracked through CACAO metadata",
      icon: GitBranch,
      variant: ThemeVariant.Accent,
    },
    {
      label: "Persisted executions",
      value: executionSummaries.length,
      caption: `${successfulExecutions} successful`,
      icon: ShieldCheck,
      variant: ThemeVariant.Success,
    },
    {
      label: "Running now",
      value: ongoingExecutions,
      caption: manualActions ? `${manualActions} awaiting input` : "No manual input pending",
      icon: Activity,
      variant: manualActions ? ThemeVariant.Warning : ThemeVariant.Info,
    },
  ];

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
              <CardTitle>NG-SOAR dashboard</CardTitle>
              <Text>Operational overview for playbooks, executions, and authoring.</Text>
            </div>
            <DashboardHeaderActions>
              <Button
                type="button"
                $variant={ThemeVariant.Primary}
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.PLAYBOOKS.NEW)}
              >
                <Icon $icon={FilePlusCorner} $size={ThemeSize.Medium} />
                New playbook
              </Button>
              <Button
                type="button"
                $variant={ThemeVariant.Secondary}
                $ghost
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.ROASTER.BASE)}
              >
                <Icon $icon={SquareTerminal} $size={ThemeSize.Medium} />
                Roaster
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
              <CardTitle>Recent playbooks</CardTitle>
              <Button
                type="button"
                $variant={ThemeVariant.Primary}
                $ghost
                $size={ThemeSize.Small}
                onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
              >
                View all
              </Button>
            </CardHeader>
            <CardContentStack>
              {recentPlaybooks.length ? (
                <DashboardList>
                  {recentPlaybooks.map((playbook) => {
                    const metadata = extractPlaybookMetadata(playbook);
                    return (
                      <DashboardListItem
                        key={playbook.id}
                        type="button"
                        onClick={() => navigate(playbookDetailPath(playbook.id))}
                      >
                        <DashboardListMain>
                          <DashboardListTitle>{playbook.name}</DashboardListTitle>
                          <DashboardListMeta>
                            Modified {formatDateTime(playbook.modified, true)}
                          </DashboardListMeta>
                        </DashboardListMain>
                        <Badge
                          $variant={
                            metadata.hasManualSteps
                              ? ThemeVariant.Warning
                              : ThemeVariant.Info
                          }
                        >
                          {metadata.hasManualSteps ? "Manual" : "Automated"}
                        </Badge>
                      </DashboardListItem>
                    );
                  })}
                </DashboardList>
              ) : (
                <EmptyState>No playbooks available.</EmptyState>
              )}
            </CardContentStack>
          </CardContainer>

          <CardContainer>
            <CardHeader>
              <CardTitle>Platform status</CardTitle>
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
                  <StatusLabel>Uptime</StatusLabel>
                  <StatusValue>
                    {formatDuration(systemStatusQuery.data?.uptime?.milliseconds)}
                  </StatusValue>
                </StatusRow>
                <StatusRow>
                  <StatusLabel>Last execution</StatusLabel>
                  <StatusValue>
                    {latestExecution
                      ? formatDateTime(latestTimestamp(latestExecution), true)
                      : "No executions"}
                  </StatusValue>
                </StatusRow>
              </StatusRows>
            </CardContentStack>
          </CardContainer>
        </DashboardGrid>

        <DashboardGrid>
          <CardContainer>
            <CardHeader>
              <CardTitle>Recent executions</CardTitle>
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
              {recentExecutions.length ? (
                <DashboardList>
                  {recentExecutions.map((summary) => (
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
                        <DashboardListTitle>
                          {summary.playbookId}
                        </DashboardListTitle>
                        <DashboardListMeta>
                          {summary.durationMs
                            ? formatDuration(summary.durationMs)
                            : formatDateTime(latestTimestamp(summary), true)}
                        </DashboardListMeta>
                      </DashboardListMain>
                      <Badge $variant={executionStatusVariant(summary.status)}>
                        {executionStatusLabels[summary.status]}
                      </Badge>
                    </DashboardListItem>
                  ))}
                </DashboardList>
              ) : (
                <EmptyState>No persisted executions yet.</EmptyState>
              )}
            </CardContentStack>
          </CardContainer>

          <CardContainer>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
              <Icon $icon={Clock3} $size={ThemeSize.ExtraLarge} />
            </CardHeader>
            <CardContentStack>
              <DashboardList>
                <DashboardListItem
                  type="button"
                  onClick={() => navigate(PATHS.PLAYBOOKS.NEW)}
                >
                  <DashboardListMain>
                    <DashboardListTitle>Create playbook</DashboardListTitle>
                    <DashboardListMeta>Start from the Roaster authoring flow</DashboardListMeta>
                  </DashboardListMain>
                  <Icon $icon={FilePlusCorner} />
                </DashboardListItem>
                <DashboardListItem
                  type="button"
                  onClick={() => navigate(PATHS.ROASTER.BASE)}
                >
                  <DashboardListMain>
                    <DashboardListTitle>Open Roaster</DashboardListTitle>
                    <DashboardListMeta>Author and inspect CACAO content</DashboardListMeta>
                  </DashboardListMain>
                  <Icon $icon={RefreshCw} />
                </DashboardListItem>
                <DashboardListItem
                  type="button"
                  onClick={() => navigate(PATHS.MONITORING.BASE)}
                >
                  <DashboardListMain>
                    <DashboardListTitle>Review executions</DashboardListTitle>
                    <DashboardListMeta>
                      Check runs and manual input states
                    </DashboardListMeta>
                  </DashboardListMain>
                  <Icon $icon={Play} />
                </DashboardListItem>
                {manualActions ? (
                  <DashboardListItem
                    type="button"
                    onClick={() => navigate(PATHS.MONITORING.BASE)}
                  >
                    <DashboardListMain>
                      <DashboardListTitle>Manual input waiting</DashboardListTitle>
                      <DashboardListMeta>
                        {manualActions} execution step needs attention
                      </DashboardListMeta>
                    </DashboardListMain>
                    <Icon $icon={Hand} />
                  </DashboardListItem>
                ) : null}
              </DashboardList>
            </CardContentStack>
          </CardContainer>
        </DashboardGrid>
      </DashboardLayout>
    </SuspenseCard>
  );
};
