import { Badge, ThemeVariant } from "@/components";

import { PlaybookMetadata } from "./playbookSearch";
import { PlaybookMeta } from "./PlaybookMetadataBadges.styles";
import {
  executionStatusLabels,
  executionStatusVariant,
} from "./executions/executionStatus";

type PlaybookMetadataBadgesProps = {
  metadata: PlaybookMetadata;
};

export function NgSoarPlaybookMetadataBadges({ metadata }: PlaybookMetadataBadgesProps) {
  return (
    <PlaybookMeta>
      {metadata.playbookType && (
        <Badge $variant={ThemeVariant.Info}>{metadata.playbookType}</Badge>
      )}
      {metadata.authorName && (
        <Badge $variant={ThemeVariant.Secondary}>{metadata.authorName}</Badge>
      )}
      {metadata.hasManualSteps && (
        <Badge $variant={ThemeVariant.Warning}>manual</Badge>
      )}
      {metadata.isDerivedVersion && (
        <Badge $variant={ThemeVariant.Accent}>version</Badge>
      )}
      <Badge $variant={ThemeVariant.Secondary}>
        {metadata.workflowStepCount} steps
      </Badge>
      {metadata.lastExecutionStatus && (
        <Badge $variant={executionStatusVariant(metadata.lastExecutionStatus)}>
          {executionStatusLabels[metadata.lastExecutionStatus]}
        </Badge>
      )}
    </PlaybookMeta>
  );
}
