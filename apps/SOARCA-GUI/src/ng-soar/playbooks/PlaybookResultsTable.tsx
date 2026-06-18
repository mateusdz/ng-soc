/*
 * Copyright (c) 2026 Cyentific AS.
 * All Rights Reserved.
 *
 * This file is part of the Cyentific CACAO Platform.
 * Unauthorized copying, modification, distribution, or commercial use is prohibited.
 */

import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import {
  Badge,
  Button,
  Cell,
  HeaderCell,
  Icon,
  Row,
  Table,
  TableBody,
  TableHead,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { type ExecutionSummaryStatus } from "@/ng-soar/api/executionSummaries";
import { formatDateTime } from "@/utils";

import { executionStatusLabels } from "./executions/executionStatus";
import {
  playbookTypeLabels,
  PlaybookSearchRecord,
} from "./playbookSearch";
import {
  ActionCell,
  AuthorText,
  BadgeGroup,
  LabelChip,
  MutedText,
  PlaybookDescriptionText,
  PlaybookNameText,
  ResultsTableViewport,
  RiskBar,
  RiskBarTrack,
  RiskLine,
  RiskStack,
  SortHeaderButton,
  StatusStack,
  StatusText,
  type StatusTone,
  TypeText,
} from "./PlaybookResultsTable.styles";

type PlaybookResultsTableProps = {
  records: PlaybookSearchRecord[];
  onOpenPlaybook: (playbookId: string) => void;
};

type SortDirection = "asc" | "desc";

type SortKey =
  | "playbook"
  | "author"
  | "type"
  | "labels"
  | "modified"
  | "workflow"
  | "summary"
  | "risk"
  | "validity"
  | "execution";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

type SortableHeaderProps = {
  label: string;
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  width?: string;
};

function compactNumber(value?: number) {
  return typeof value === "number" ? value : undefined;
}

function compareString(a: string | undefined, b: string | undefined) {
  return (a ?? "").localeCompare(b ?? "", undefined, { sensitivity: "base" });
}

function compareNumber(a: number | undefined, b: number | undefined) {
  return (a ?? -1) - (b ?? -1);
}

function displayType(type?: string) {
  return type ? playbookTypeLabels[type] ?? type : "N/A";
}

function riskScore(record: PlaybookSearchRecord) {
  return Math.max(
    record.playbook.severity ?? 0,
    record.playbook.priority ?? 0,
    record.playbook.impact ?? 0,
  );
}

function validityScore(record: PlaybookSearchRecord) {
  if (record.metadata.isExecutable) {
    return 2;
  }

  return record.metadata.isValid ? 1 : 0;
}

function executionScore(record: PlaybookSearchRecord) {
  return record.metadata.lastExecutionAt ?? record.metadata.lastExecutionStatus ?? "";
}

function executionStatusTone(status?: ExecutionSummaryStatus): StatusTone {
  switch (status) {
    case "successfully_executed":
      return "success";
    case "ongoing":
      return "info";
    case "await_user_input":
      return "warning";
    case "failed":
    case "server_side_error":
    case "client_side_error":
    case "timeout_error":
    case "exception_condition_error":
      return "error";
    default:
      return "neutral";
  }
}

function sortValue(record: PlaybookSearchRecord, key: SortKey) {
  switch (key) {
    case "playbook":
      return record.playbook.name;
    case "author":
      return record.metadata.authorName;
    case "type":
      return displayType(record.metadata.playbookType);
    case "labels":
      return record.metadata.labels.join(" ");
    case "modified":
      return record.metadata.modifiedAt;
    case "workflow":
      return record.metadata.workflowStepCount;
    case "summary":
      return record.metadata.summaryFeatures.join(" ");
    case "risk":
      return riskScore(record);
    case "validity":
      return validityScore(record);
    case "execution":
      return executionScore(record);
    default:
      return "";
  }
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
  width,
}: SortableHeaderProps) {
  const isActive = sort.key === sortKey;
  const icon = !isActive ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <HeaderCell $width={width}>
      <SortHeaderButton type="button" onClick={() => onSort(sortKey)}>
        {label}
        <Icon $icon={icon} $size={ThemeSize.Small} />
      </SortHeaderButton>
    </HeaderCell>
  );
}

function RiskRows({ record }: { record: PlaybookSearchRecord }) {
  const risks = [
    {
      label: "Severity",
      value: compactNumber(record.playbook.severity),
      variant: "error" as const,
    },
    {
      label: "Priority",
      value: compactNumber(record.playbook.priority),
      variant: "warning" as const,
    },
    {
      label: "Impact",
      value: compactNumber(record.playbook.impact),
      variant: "info" as const,
    },
  ].filter((item) => typeof item.value === "number");

  if (risks.length === 0) {
    return <MutedText>—</MutedText>;
  }

  return (
    <RiskStack>
      {risks.map((risk) => (
        <RiskLine key={risk.label}>
          <span>
            {risk.label} {risk.value}
          </span>
          <RiskBarTrack>
            <RiskBar $value={risk.value ?? 0} $variant={risk.variant} />
          </RiskBarTrack>
        </RiskLine>
      ))}
    </RiskStack>
  );
}

function compareRecords(a: PlaybookSearchRecord, b: PlaybookSearchRecord, sort: SortState) {
  const aValue = sortValue(a, sort.key);
  const bValue = sortValue(b, sort.key);
  const direction = sort.direction === "asc" ? 1 : -1;
  const result =
    typeof aValue === "number" || typeof bValue === "number"
      ? compareNumber(aValue as number | undefined, bValue as number | undefined)
      : compareString(String(aValue ?? ""), String(bValue ?? ""));

  return result * direction;
}

export function NgSoarPlaybookResultsTable({
  records,
  onOpenPlaybook,
}: PlaybookResultsTableProps) {
  const [sort, setSort] = React.useState<SortState>({
    key: "playbook",
    direction: "asc",
  });
  const sortedRecords = React.useMemo(
    () => [...records].sort((a, b) => compareRecords(a, b, sort)),
    [records, sort],
  );
  const toggleSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <ResultsTableViewport>
      <Table>
        <TableHead>
          <Row>
            <SortableHeader
              label="Playbook"
              sortKey="playbook"
              sort={sort}
              onSort={toggleSort}
              width="24%"
            />
            <SortableHeader label="Author" sortKey="author" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Type" sortKey="type" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Labels" sortKey="labels" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Modified" sortKey="modified" sort={sort} onSort={toggleSort} />
            <SortableHeader
              label="Workflow steps"
              sortKey="workflow"
              sort={sort}
              onSort={toggleSort}
            />
            <SortableHeader
              label="Playbook summary"
              sortKey="summary"
              sort={sort}
              onSort={toggleSort}
            />
            <SortableHeader label="Risk" sortKey="risk" sort={sort} onSort={toggleSort} />
            <SortableHeader label="Validity" sortKey="validity" sort={sort} onSort={toggleSort} />
            <SortableHeader
              label="Last execution"
              sortKey="execution"
              sort={sort}
              onSort={toggleSort}
            />
            <HeaderCell $alignContent="right">Action</HeaderCell>
          </Row>
        </TableHead>
        <TableBody>
          {sortedRecords.map((record) => {
            const { playbook, metadata } = record;
            const labels = metadata.labels.slice(0, 4);
            const hiddenLabelCount = Math.max(0, metadata.labels.length - labels.length);
            const summaryFeatures = metadata.summaryFeatures.slice(0, 3);
            const hiddenSummaryCount = Math.max(
              0,
              metadata.summaryFeatures.length - summaryFeatures.length,
            );

            return (
              <Row
                key={playbook.id}
                $isClickable
                onClick={() => onOpenPlaybook(playbook.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenPlaybook(playbook.id);
                  }
                }}
                tabIndex={0}
              >
                <Cell>
                  <PlaybookNameText>{playbook.name}</PlaybookNameText>
                  <PlaybookDescriptionText>
                    {playbook.description || "No description available"}
                  </PlaybookDescriptionText>
                </Cell>
                <Cell>
                  <AuthorText>{metadata.authorName ?? "Unknown author"}</AuthorText>
                </Cell>
                <Cell>
                  <TypeText>{displayType(metadata.playbookType)}</TypeText>
                </Cell>
                <Cell>
                  {labels.length > 0 ? (
                    <BadgeGroup>
                      {labels.map((label) => (
                        <LabelChip key={label} title={label}>
                          {label}
                        </LabelChip>
                      ))}
                      {hiddenLabelCount > 0 ? (
                        <LabelChip>+{hiddenLabelCount}</LabelChip>
                      ) : null}
                    </BadgeGroup>
                  ) : (
                    <MutedText>—</MutedText>
                  )}
                </Cell>
                <Cell>
                  <MutedText>{formatDateTime(metadata.modifiedAt, true)}</MutedText>
                </Cell>
                <Cell>
                  <MutedText>{metadata.workflowStepCount}</MutedText>
                </Cell>
                <Cell>
                  {summaryFeatures.length > 0 ? (
                    <BadgeGroup>
                      {summaryFeatures.map((feature) => (
                        <Badge key={feature} $variant={ThemeVariant.Secondary}>
                          {feature}
                        </Badge>
                      ))}
                      {hiddenSummaryCount > 0 ? (
                        <Badge $variant={ThemeVariant.Secondary}>
                          +{hiddenSummaryCount}
                        </Badge>
                      ) : null}
                    </BadgeGroup>
                  ) : (
                    <MutedText>Not provided</MutedText>
                  )}
                </Cell>
                <Cell>
                  <RiskRows record={record} />
                </Cell>
                <Cell>
                  <StatusStack>
                    <StatusText $tone={metadata.isValid ? "success" : "error"}>
                      {metadata.isValid ? "Valid" : "Invalid"}
                    </StatusText>
                    <StatusText $tone={metadata.isExecutable ? "info" : "neutral"}>
                      {metadata.isExecutable ? "Executable" : "Not executable"}
                    </StatusText>
                  </StatusStack>
                </Cell>
                <Cell>
                  {metadata.lastExecutionStatus ? (
                    <StatusStack>
                      <StatusText $tone={executionStatusTone(metadata.lastExecutionStatus)}>
                        {executionStatusLabels[metadata.lastExecutionStatus]}
                      </StatusText>
                      <MutedText>{formatDateTime(metadata.lastExecutionAt, true)}</MutedText>
                    </StatusStack>
                  ) : (
                    <StatusText $tone="neutral">Not executed</StatusText>
                  )}
                </Cell>
                <Cell $alignContent="right" onClick={(event) => event.stopPropagation()}>
                  <ActionCell>
                    <Button
                      $variant={ThemeVariant.Primary}
                      $size={ThemeSize.Small}
                      $ghost
                      onClick={() => onOpenPlaybook(playbook.id)}
                    >
                      Open
                    </Button>
                  </ActionCell>
                </Cell>
              </Row>
            );
          })}
        </TableBody>
      </Table>
    </ResultsTableViewport>
  );
}
