import React from "react";

import {
  CardContainer,
  CardHeader,
  CardTitle,
  Text,
} from "@/components";
import { useThemeMode } from "@/theme";

import {
  ApiExplorerHeaderBody,
  ApiFrame,
  ApiSwitchButton,
  ApiSwitcher,
  SettingsStack,
} from "./SettingsPanels.styles";

const SOARCA_SWAGGER_URL = "/api/ng-soar/swagger/soarca.html";
const NG_SOAR_SWAGGER_URL = "/api/ng-soar/swagger/index.html";

type ApiExplorerTarget = "ng-soar" | "soarca";

const apiExplorerTargets: Record<
  ApiExplorerTarget,
  { label: string; title: string; src: string; description: string }
> = {
  "ng-soar": {
    label: "NG-SOAR API",
    title: "NG-SOAR Swagger UI",
    src: NG_SOAR_SWAGGER_URL,
    description:
      "Platform health and persisted execution-summary endpoints for NG-SOAR extensions.",
  },
  soarca: {
    label: "SOARCA API",
    title: "SOARCA Swagger UI",
    src: SOARCA_SWAGGER_URL,
    description:
      "Playbook storage, execution, reporting, and manual-input APIs provided by SOARCA.",
  },
};

export const NgSoarApiExplorerPanel: React.FC = () => {
  const [activeApi, setActiveApi] =
    React.useState<ApiExplorerTarget>("ng-soar");
  const { resolved } = useThemeMode();
  const activeTarget = apiExplorerTargets[activeApi];
  const iframeSrc = `${activeTarget.src}?theme=${resolved}`;

  return (
    <SettingsStack>
      <CardContainer>
        <CardHeader>
          <CardTitle>API Explorer</CardTitle>
        </CardHeader>
        <ApiExplorerHeaderBody>
          <Text>{activeTarget.description}</Text>
          <ApiSwitcher aria-label="Select API documentation">
            {(Object.keys(apiExplorerTargets) as ApiExplorerTarget[]).map(
              (target) => (
                <ApiSwitchButton
                  key={target}
                  type="button"
                  $active={target === activeApi}
                  onClick={() => setActiveApi(target)}
                >
                  {apiExplorerTargets[target].label}
                </ApiSwitchButton>
              ),
            )}
          </ApiSwitcher>
        </ApiExplorerHeaderBody>
        <ApiFrame
          key={iframeSrc}
          title={activeTarget.title}
          src={iframeSrc}
        />
      </CardContainer>
    </SettingsStack>
  );
};
