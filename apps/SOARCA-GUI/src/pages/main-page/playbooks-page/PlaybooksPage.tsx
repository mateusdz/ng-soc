import { SuspenseCard, ThemeSize, ThemeVariant } from "@/components";
import { useQuery } from "@tanstack/react-query";
import { FilePlusCorner } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";

import { getPlaybooks } from "@/api/playbooks";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  Icon,
} from "@/components";
import { ErrorResponse } from "@/types";
import { PATHS } from "@/utils";
import {
  NgSoarNoPlaybookMatches,
  NgSoarPlaybookFiltersToolbar,
} from "@/ng-soar/playbooks/PlaybookFiltersToolbar";
import { NgSoarPlaybookResultsTable } from "@/ng-soar/playbooks/PlaybookResultsTable";
import { useNgSoarPlaybookSearch } from "@/ng-soar/playbooks/playbookSearch";
import {
  createLastExecutionSummaryMap,
  getExecutionSummaries,
} from "@/ng-soar/api/executionSummaries";
import {
  createIdentityMap,
  getIdentities,
} from "@/ng-soar/api/identities";

export const PlaybooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["playbooks"],
    queryFn: getPlaybooks,
    refetchOnWindowFocus: false,
  });
  const { data: executionSummaries = [] } = useQuery({
    queryKey: ["ng-soar-execution-summaries"],
    queryFn: getExecutionSummaries,
    enabled: Boolean(data?.length),
    refetchOnWindowFocus: false,
  });
  const { data: identities = [] } = useQuery({
    queryKey: ["ng-soar-identities"],
    queryFn: getIdentities,
    refetchOnWindowFocus: false,
  });

  const executionSummariesByPlaybook = React.useMemo(
    () => createLastExecutionSummaryMap(executionSummaries),
    [executionSummaries],
  );
  const identitiesById = React.useMemo(
    () => createIdentityMap(identities),
    [identities],
  );
  const playbookSearch = useNgSoarPlaybookSearch(
    [...(data || [])],
    executionSummariesByPlaybook,
    identitiesById,
  );
  const noContent =
    !isLoading && !isError && playbookSearch.searchRecords.length === 0;
  const noMatches =
    !isLoading &&
    !isError &&
    playbookSearch.searchRecords.length > 0 &&
    playbookSearch.sortedRecords.length === 0;
  const parsedError = getErrorFromApiResponse(error as Error) as ErrorResponse;

  const handlePlaybookClick = (playbookId: string) => {
    navigate(PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId));
  };

  return (
    <SuspenseCard
      $isLoading={isLoading}
      $isError={isError}
      $errorMessage={parsedError?.message}
      $returnedNoContent={noContent}
      $noContentMessage="No playbooks available"
    >
      <CardContainer>
        <CardHeader>
          <CardTitle>Playbooks</CardTitle>
          <Button
            $variant={ThemeVariant.Primary}
            $size={ThemeSize.Small}
            onClick={() => navigate(PATHS.PLAYBOOKS.NEW)}
          >
            <Icon $icon={FilePlusCorner} $size={ThemeSize.Medium} />
            New
          </Button>
        </CardHeader>
        <CardBody>
          <NgSoarPlaybookFiltersToolbar search={playbookSearch} />

          {noMatches ? <NgSoarNoPlaybookMatches /> : null}
          <NgSoarPlaybookResultsTable
            records={playbookSearch.sortedRecords}
            onOpenPlaybook={handlePlaybookClick}
          />
        </CardBody>
      </CardContainer>
    </SuspenseCard>
  );
};
