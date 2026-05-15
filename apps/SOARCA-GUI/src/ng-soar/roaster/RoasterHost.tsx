import {
  BookOpen,
  ExternalLink,
  FilePlusCorner,
  Flame,
  RefreshCw,
  Workflow,
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import {
  Badge,
  Button,
  Icon,
  Spinner,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { PATHS } from "@/utils";

import {
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
} from "./RoasterHost.styles";

function playbookDetailPath(playbookId: string) {
  return PATHS.PLAYBOOKS.DETAIL.replace(":playbookId", playbookId);
}

export const NgSoarRoasterHost: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playbookId } = useParams();
  const [frameVersion, setFrameVersion] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const embeddedPath = location.pathname.replace(/^\/roaster/, "") || "/";
  const iframeSearch = new URLSearchParams(location.search);
  iframeSearch.set("ngSoarEmbed", "1");
  const iframeSrc = `/_roaster${embeddedPath}?${iframeSearch.toString()}`;
  const isPlaybookRoute = Boolean(playbookId);

  React.useEffect(() => {
    setIsLoading(true);
  }, [iframeSrc, frameVersion]);

  return (
    <RoasterPageWrapper>
      <RoasterHeader>
        <RoasterTitleGroup>
          <RoasterIcon>
            <Icon $icon={Flame} $size={ThemeSize.ExtraLarge} />
          </RoasterIcon>
          <div>
            <RoasterTitle>CACAO Roaster</RoasterTitle>
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

      <RoasterFrameShell>
        <RoasterLoadingOverlay $visible={isLoading}>
          <Spinner $size={ThemeSize.Large} />
          Loading Roaster
        </RoasterLoadingOverlay>
        <RoasterFrame
          key={`${iframeSrc}:${frameVersion}`}
          title="CACAO Roaster"
          src={iframeSrc}
          onLoad={() => setIsLoading(false)}
        />
      </RoasterFrameShell>
    </RoasterPageWrapper>
  );
};
