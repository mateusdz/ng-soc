import {
  BookOpen,
  ExternalLink,
  FilePlusCorner,
  Play,
  RefreshCw,
  SquarePen,
  Workflow,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import { triggerPlaybookById } from "@/api/trigger";
import {
  Badge,
  Button,
  Icon,
  Spinner,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { getLastExecutionSummary } from "@/ng-soar/api/executionSummaries";
import {
  executionStatusLabels,
  executionStatusVariant,
} from "@/ng-soar/playbooks/executions/executionStatus";
import { formatDateTime, formatDuration, PATHS } from "@/utils";

import {
  ExecutionDetailGrid,
  ExecutionDetailLabel,
  ExecutionDetailValue,
  ExecutionPanel,
  ExecutionPanelActions,
  ExecutionPanelHeader,
  ExecutionPanelText,
  ExecutionPanelTitle,
  ExecutionStatusBox,
  RoasterContextActions,
  RoasterContextBar,
  RoasterContextLabel,
  RoasterContextMain,
  RoasterContextValue,
  RoasterDescription,
  RoasterFrame,
  RoasterFrameShell,
  RoasterHeader,
  RoasterHeaderActions,
  RoasterIcon,
  RoasterLoadingOverlay,
  RoasterPageWrapper,
  RoasterTitle,
  RoasterTitleGroup,
  RoasterWorkspace,
} from "./RoasterHost.styles";

function playbookDetailPath(playbookId: string) {
  return PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);
}

export const NgSoarRoasterHost: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playbookId } = useParams();
  const [frameVersion, setFrameVersion] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const embeddedPath = location.pathname.replace(/^\/roaster/, "") || "/";
  const iframeSearch = new URLSearchParams(location.search);
  iframeSearch.set("ngSoarEmbed", "1");
  const iframeSrc = `/_roaster${embeddedPath}?${iframeSearch.toString()}`;
  const isPlaybookRoute = Boolean(playbookId);
  const { data: lastExecution } = useQuery({
    queryKey: ["ng-soar-last-execution", playbookId],
    queryFn: () => getLastExecutionSummary(playbookId!),
    enabled: Boolean(playbookId),
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });
  const executePlaybook = useMutation({
    mutationFn: () => triggerPlaybookById(playbookId!),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ["ng-soar-execution-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["ng-soar-last-execution", playbookId] });
      navigate(PATHS.MONITORING.DETAIL.replace(":executionId", execution.execution_id));
    },
  });
  const lastExecutionAt =
    lastExecution?.completedAt ??
    lastExecution?.startedAt ??
    lastExecution?.updatedAt;

  React.useEffect(() => {
    setIsLoading(true);
  }, [iframeSrc, frameVersion]);

  return (
    <RoasterPageWrapper>
      <RoasterHeader>
        <RoasterTitleGroup>
          <RoasterIcon>
            <Icon $icon={SquarePen} $size={ThemeSize.ExtraLarge} />
          </RoasterIcon>
          <div>
            <RoasterTitle>Playbook Editor</RoasterTitle>
            <RoasterDescription>
              Author, inspect, validate, save, and execute CACAO playbooks inside NG-SOAR.
            </RoasterDescription>
          </div>
        </RoasterTitleGroup>
        <RoasterHeaderActions>
          <Button
            type="button"
            $variant={ThemeVariant.Primary}
            $ghost
            onClick={() => navigate(PATHS.ROASTER.BASE)}
          >
            <Icon $icon={FilePlusCorner} $size={ThemeSize.Medium} />
            New playbook
          </Button>
          <Button
            type="button"
            $variant={ThemeVariant.Secondary}
            $ghost
            onClick={() => setFrameVersion((value) => value + 1)}
          >
            <Icon $icon={RefreshCw} $size={ThemeSize.Medium} />
            Reload
          </Button>
          <Button
            as="a"
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            $variant={ThemeVariant.Secondary}
            $ghost
          >
            <Icon $icon={ExternalLink} $size={ThemeSize.Medium} />
            Open standalone
          </Button>
        </RoasterHeaderActions>
      </RoasterHeader>

      <RoasterContextBar>
        <RoasterContextMain>
          <Badge $variant={isPlaybookRoute ? ThemeVariant.Info : ThemeVariant.Success}>
            <Icon
              $icon={isPlaybookRoute ? Workflow : FilePlusCorner}
              $size={ThemeSize.Medium}
            />
            {isPlaybookRoute ? "Linked playbook" : "Roaster workspace"}
          </Badge>
          {playbookId ? (
            <>
              <RoasterContextLabel>Playbook ID</RoasterContextLabel>
              <RoasterContextValue title={playbookId}>{playbookId}</RoasterContextValue>
            </>
          ) : (
            <RoasterContextLabel>
              Create a new CACAO playbook or import existing content.
            </RoasterContextLabel>
          )}
        </RoasterContextMain>
        <RoasterContextActions>
          <Button
            type="button"
            $variant={ThemeVariant.Secondary}
            $ghost
            onClick={() => navigate(PATHS.PLAYBOOKS.BASE)}
          >
            <Icon $icon={BookOpen} $size={ThemeSize.Medium} />
            Playbooks
          </Button>
          {playbookId ? (
            <Button
              type="button"
              $variant={ThemeVariant.Primary}
              $ghost
              onClick={() => navigate(playbookDetailPath(playbookId))}
            >
              <Icon $icon={Workflow} $size={ThemeSize.Medium} />
              Details
            </Button>
          ) : null}
        </RoasterContextActions>
      </RoasterContextBar>

      <RoasterWorkspace>
        <RoasterFrameShell>
          <RoasterLoadingOverlay $visible={isLoading}>
            <Spinner $size={ThemeSize.Large} />
            Loading editor
          </RoasterLoadingOverlay>
          <RoasterFrame
            key={`${iframeSrc}:${frameVersion}`}
            title="CACAO Roaster"
            src={iframeSrc}
            onLoad={() => setIsLoading(false)}
          />
        </RoasterFrameShell>
        <ExecutionPanel>
          <ExecutionPanelHeader>
            <ExecutionPanelTitle>Execution</ExecutionPanelTitle>
            <ExecutionPanelText>
              Execute the stored SOARCA playbook or monitor the latest run while
              keeping the editor visible.
            </ExecutionPanelText>
          </ExecutionPanelHeader>

          <ExecutionStatusBox>
            {lastExecution ? (
              <>
                <Badge $variant={executionStatusVariant(lastExecution.status)}>
                  {executionStatusLabels[lastExecution.status]}
                </Badge>
                <ExecutionDetailGrid>
                  <ExecutionDetailLabel>Execution</ExecutionDetailLabel>
                  <ExecutionDetailValue title={lastExecution.executionId}>
                    {lastExecution.executionId ?? lastExecution.id}
                  </ExecutionDetailValue>
                  <ExecutionDetailLabel>Source</ExecutionDetailLabel>
                  <ExecutionDetailValue>{lastExecution.source}</ExecutionDetailValue>
                  <ExecutionDetailLabel>Updated</ExecutionDetailLabel>
                  <ExecutionDetailValue>
                    {lastExecutionAt ? formatDateTime(lastExecutionAt, true) : "Unknown"}
                  </ExecutionDetailValue>
                  <ExecutionDetailLabel>Duration</ExecutionDetailLabel>
                  <ExecutionDetailValue>
                    {lastExecution.durationMs !== undefined
                      ? formatDuration(lastExecution.durationMs)
                      : "Unknown"}
                  </ExecutionDetailValue>
                </ExecutionDetailGrid>
              </>
            ) : (
              <>
                <Badge $variant={ThemeVariant.Secondary}>No execution yet</Badge>
                <ExecutionPanelText>
                  The latest persisted execution state will appear here after this
                  playbook runs.
                </ExecutionPanelText>
              </>
            )}
          </ExecutionStatusBox>

          <ExecutionPanelActions>
            <Button
              type="button"
              $variant={ThemeVariant.Primary}
              disabled={!playbookId || executePlaybook.isLoading}
              onClick={() => executePlaybook.mutate()}
            >
              <Icon $icon={Play} $size={ThemeSize.Medium} />
              {executePlaybook.isLoading ? "Executing..." : "Execute playbook"}
            </Button>
            {lastExecution?.executionId ? (
              <Button
                type="button"
                $variant={ThemeVariant.Secondary}
                $ghost
                onClick={() =>
                  navigate(
                    PATHS.MONITORING.DETAIL.replace(
                      ":executionId",
                      lastExecution.executionId!,
                    ),
                  )
                }
              >
                <Icon $icon={Workflow} $size={ThemeSize.Medium} />
                Open monitoring
              </Button>
            ) : (
              <Button
                type="button"
                $variant={ThemeVariant.Secondary}
                $ghost
                onClick={() => navigate(PATHS.MONITORING.BASE)}
              >
                <Icon $icon={Workflow} $size={ThemeSize.Medium} />
                Monitoring
              </Button>
            )}
          </ExecutionPanelActions>

          {executePlaybook.isError ? (
            <ExecutionPanelText>
              Execution failed to start. Validate and save the playbook, then try again.
            </ExecutionPanelText>
          ) : null}
          {!playbookId ? (
            <ExecutionPanelText>
              Execution is available after opening a stored playbook from the
              playbook library.
            </ExecutionPanelText>
          ) : (
            <ExecutionPanelText>
              If you have unsaved edits, save them in the editor before executing.
              Roaster&apos;s Execute menu can still be used for its native SOARCA flow.
            </ExecutionPanelText>
          )}
        </ExecutionPanel>
      </RoasterWorkspace>
    </RoasterPageWrapper>
  );
};
