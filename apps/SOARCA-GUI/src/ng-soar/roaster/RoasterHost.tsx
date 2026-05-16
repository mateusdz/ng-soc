import {
  Play,
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
  RoasterFrame,
  RoasterFrameShell,
  RoasterLoadingOverlay,
  RoasterPageWrapper,
  RoasterWorkspace,
} from "./RoasterHost.styles";

export const NgSoarRoasterHost: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playbookId } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const embeddedPath = location.pathname.replace(/^\/roaster/, "") || "/";
  const iframeSearch = new URLSearchParams(location.search);
  iframeSearch.set("ngSoarEmbed", "1");
  const iframeSrc = `/_roaster${embeddedPath}?${iframeSearch.toString()}`;
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
  }, [iframeSrc]);

  return (
    <RoasterPageWrapper>
      <RoasterWorkspace>
        <RoasterFrameShell>
          <RoasterLoadingOverlay $visible={isLoading}>
            <Spinner $size={ThemeSize.Large} />
            Loading editor
          </RoasterLoadingOverlay>
          <RoasterFrame
            key={iframeSrc}
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
