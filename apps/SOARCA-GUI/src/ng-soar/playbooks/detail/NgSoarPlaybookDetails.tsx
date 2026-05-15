import { useQuery } from "@tanstack/react-query";

import { getLastExecutionSummary } from "@/ng-soar/api/executionSummaries";
import {
  createIdentityMap,
  getIdentities,
} from "@/ng-soar/api/identities";
import {
  executionStatusLabels,
  executionStatusVariant,
} from "@/ng-soar/playbooks/executions/executionStatus";
import { extractPlaybookMetadata } from "@/ng-soar/playbooks/playbookSearch";
import { getPlaybookVersionMetadata } from "@/ng-soar/playbooks/versioning/playbookVersions";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  FormLabel,
  ThemeVariant,
} from "@/components";
import { Playbook } from "@/types";
import { formatDateTime, formatDuration } from "@/utils";

import {
  DetailGrid,
  DetailItem,
  DetailsStack,
  DetailValue,
  InlineBadges,
  MutedValue,
} from "./NgSoarPlaybookDetails.styles";

type NgSoarPlaybookDetailsProps = {
  playbook: Playbook;
};

export function NgSoarPlaybookDetails({ playbook }: NgSoarPlaybookDetailsProps) {
  const { data: identities = [] } = useQuery({
    queryKey: ["ng-soar-identities"],
    queryFn: getIdentities,
    refetchOnWindowFocus: false,
  });
  const identitiesById = createIdentityMap(identities);
  const metadata = extractPlaybookMetadata(playbook, identitiesById);
  const versionMetadata = getPlaybookVersionMetadata(playbook);
  const { data: lastExecution, isLoading } = useQuery({
    queryKey: ["ng-soar-last-execution", playbook.id],
    queryFn: () => getLastExecutionSummary(playbook.id),
    refetchOnWindowFocus: false,
  });

  const lastExecutionAt =
    lastExecution?.completedAt ?? lastExecution?.startedAt ?? lastExecution?.updatedAt;

  return (
    <CardContainer>
      <CardHeader>
        <CardTitle>NG-SOAR details</CardTitle>
      </CardHeader>
      <CardBody>
        <DetailsStack>
          <DetailGrid>
            <DetailItem>
              <FormLabel>Author</FormLabel>
              <DetailValue>{metadata.authorName ?? "Unknown author"}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Author identity ID</FormLabel>
              <DetailValue>{metadata.author ?? "Not available"}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Version label</FormLabel>
              <DetailValue>{metadata.versionLabel}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Version lineage</FormLabel>
              <DetailValue>
                {versionMetadata.isDerivedVersion ? (
                  <InlineBadges>
                    <Badge $variant={ThemeVariant.Accent}>Derived version</Badge>
                    <Badge $variant={ThemeVariant.Secondary}>
                      {versionMetadata.parentIds.length} parent
                      {versionMetadata.parentIds.length === 1 ? "" : "s"}
                    </Badge>
                  </InlineBadges>
                ) : (
                  <Badge $variant={ThemeVariant.Secondary}>Original playbook</Badge>
                )}
              </DetailValue>
            </DetailItem>
            {versionMetadata.parentIds.length > 0 && (
              <DetailItem>
                <FormLabel>Derived from</FormLabel>
                <DetailValue>{versionMetadata.parentIds.join(", ")}</DetailValue>
              </DetailItem>
            )}
            <DetailItem>
              <FormLabel>Workflow profile</FormLabel>
              <InlineBadges>
                <Badge $variant={ThemeVariant.Secondary}>
                  {metadata.workflowStepCount} steps
                </Badge>
                <Badge
                  $variant={
                    metadata.hasManualSteps
                      ? ThemeVariant.Warning
                      : ThemeVariant.Success
                  }
                >
                  {metadata.hasManualSteps ? "manual steps" : "automated"}
                </Badge>
              </InlineBadges>
            </DetailItem>
            <DetailItem>
              <FormLabel>Validation status</FormLabel>
              <DetailValue>
                <Badge $variant={ThemeVariant.Secondary}>Unknown</Badge>
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Last execution</FormLabel>
              <DetailValue>
                {isLoading ? (
                  <MutedValue>Loading...</MutedValue>
                ) : lastExecution ? (
                  <InlineBadges>
                    <Badge $variant={executionStatusVariant(lastExecution.status)}>
                      {executionStatusLabels[lastExecution.status]}
                    </Badge>
                    <Badge $variant={ThemeVariant.Secondary}>
                      {lastExecution.source}
                    </Badge>
                  </InlineBadges>
                ) : (
                  <MutedValue>No persisted execution yet</MutedValue>
                )}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Last execution time</FormLabel>
              <DetailValue>
                {lastExecutionAt ? (
                  formatDateTime(lastExecutionAt, true)
                ) : (
                  <MutedValue>Not available</MutedValue>
                )}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Duration</FormLabel>
              <DetailValue>
                {lastExecution?.durationMs !== undefined ? (
                  formatDuration(lastExecution.durationMs)
                ) : (
                  <MutedValue>Not available</MutedValue>
                )}
              </DetailValue>
            </DetailItem>
          </DetailGrid>
        </DetailsStack>
      </CardBody>
    </CardContainer>
  );
}
