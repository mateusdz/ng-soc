import { CheckCircle2, Flame, ListChecks } from "lucide-react";
import React from "react";

import { Button, Icon, ThemeSize, ThemeVariant } from "@/components";
import { Playbook } from "@/types";

import {
  HandoffActions,
  HandoffContent,
  HandoffDescription,
  HandoffIcon,
  HandoffPanel,
  HandoffText,
  HandoffTitle,
  PlaybookReference,
} from "./RoasterCreateHandoff.styles";

type CreatePromptProps = {
  onOpenRoaster: () => void;
};

type CreatedHandoffProps = {
  playbook: Playbook;
  onBackToPlaybooks: () => void;
  onOpenRoaster: (playbookId: string) => void;
};

export const NgSoarCreateInRoasterPrompt: React.FC<CreatePromptProps> = ({
  onOpenRoaster,
}) => (
  <HandoffPanel $tone="info">
    <HandoffContent>
      <HandoffIcon $tone="info">
        <Icon $icon={Flame} $size={ThemeSize.Medium} />
      </HandoffIcon>
      <HandoffText>
        <HandoffTitle>Create in CACAO Roaster</HandoffTitle>
        <HandoffDescription>
          Use Roaster when you want the visual authoring flow, validation, and
          guided CACAO editing before importing into NG-SOAR.
        </HandoffDescription>
      </HandoffText>
    </HandoffContent>
    <HandoffActions>
      <Button $variant={ThemeVariant.Primary} $ghost onClick={onOpenRoaster}>
        <Icon $icon={Flame} $size={ThemeSize.Small} />
        Open Roaster
      </Button>
    </HandoffActions>
  </HandoffPanel>
);

export const NgSoarCreatedPlaybookHandoff: React.FC<CreatedHandoffProps> = ({
  playbook,
  onBackToPlaybooks,
  onOpenRoaster,
}) => (
  <HandoffPanel $tone="success" aria-live="polite">
    <HandoffContent>
      <HandoffIcon $tone="success">
        <Icon $icon={CheckCircle2} $size={ThemeSize.Medium} />
      </HandoffIcon>
      <HandoffText>
        <HandoffTitle>Playbook imported into NG-SOAR</HandoffTitle>
        <HandoffDescription>
          {playbook.name || "Imported playbook"} is now available as{" "}
          <PlaybookReference>{playbook.id}</PlaybookReference>. You can review it
          in the SOARCA list or open the Roaster authoring view.
        </HandoffDescription>
      </HandoffText>
    </HandoffContent>
    <HandoffActions>
      <Button
        $variant={ThemeVariant.Primary}
        $ghost
        onClick={onBackToPlaybooks}
      >
        <Icon $icon={ListChecks} $size={ThemeSize.Small} />
        Back to Playbooks
      </Button>
      <Button
        $variant={ThemeVariant.Success}
        onClick={() => onOpenRoaster(playbook.id)}
      >
        <Icon $icon={Flame} $size={ThemeSize.Small} />
        Open in Roaster
      </Button>
    </HandoffActions>
  </HandoffPanel>
);
