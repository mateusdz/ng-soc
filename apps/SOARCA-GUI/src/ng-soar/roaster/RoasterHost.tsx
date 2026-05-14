import { ExternalLink, Flame } from "lucide-react";
import React from "react";
import { useLocation } from "react-router";

import { Button, Icon, Spacer, ThemeSize, ThemeVariant } from "@/components";

import {
  RoasterDescription,
  RoasterFrame,
  RoasterFrameShell,
  RoasterHeader,
  RoasterIcon,
  RoasterPageWrapper,
  RoasterTitle,
  RoasterTitleGroup,
} from "./RoasterHost.styles";

export const NgSoarRoasterHost: React.FC = () => {
  const location = useLocation();
  const embeddedPath = location.pathname.replace(/^\/roaster/, "") || "/";
  const iframeSearch = new URLSearchParams(location.search);
  iframeSearch.set("ngSoarEmbed", "1");
  const iframeSrc = `/_roaster${embeddedPath}?${iframeSearch.toString()}`;

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
        <Spacer $direction="horizontal" $gap="sm">
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
        </Spacer>
      </RoasterHeader>

      <RoasterFrameShell>
        <RoasterFrame title="CACAO Roaster" src={iframeSrc} />
      </RoasterFrameShell>
    </RoasterPageWrapper>
  );
};
