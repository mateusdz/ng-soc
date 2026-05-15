import React from "react";

import {
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  FormLabel,
  RadioGroup,
  Tabs,
  TabsProvider,
  useTabs,
} from "@/components";
import { NgSoarApiExplorerPanel } from "@/ng-soar/settings/ApiExplorerPanel";
import { NgSoarPlatformOperationsPanel } from "@/ng-soar/settings/PlatformOperationsPanel";
import {
  SettingsStack,
  SettingsTabsSection,
} from "@/ng-soar/settings/SettingsPanels.styles";
import {
  DetailsGrid,
  DetailsItem,
  DetailsValue,
} from "@/pages/main-page/monitoring-page/ExecutionDetailPage.styles";
import { ThemeMode, useThemeMode } from "@/theme";
import { CreditsEasterEgg } from "./Credits";

const SETTINGS_TABS = {
  appearance: "appearance",
  operations: "operations",
  api: "api",
} as const;

const SettingsTabContent: React.FC = () => {
  const { activeTab } = useTabs();

  if (activeTab === SETTINGS_TABS.operations) {
    return <NgSoarPlatformOperationsPanel />;
  }

  if (activeTab === SETTINGS_TABS.api) {
    return <NgSoarApiExplorerPanel />;
  }

  return <AppearancePanel />;
};

const AppearancePanel: React.FC = () => {
  const { mode, setMode } = useThemeMode();

  return (
    <SettingsStack>
      <CardContainer>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsGrid>
            <DetailsItem>
              <FormLabel>Theme</FormLabel>
              <RadioGroup
                name="theme-mode"
                $options={[
                  { label: "Automatic", value: "auto" },
                  { label: "Light", value: "light" },
                  { label: "Dark (Beta)", value: "dark" },
                ]}
                $value={mode}
                $onChange={(v) => setMode(v as ThemeMode)}
              />
            </DetailsItem>
          </DetailsGrid>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>NG-SOAR frontend information</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsGrid>
            <DetailsItem>
              <FormLabel>Version</FormLabel>
              <DetailsValue>{__APP_VERSION__}</DetailsValue>
            </DetailsItem>
            <CreditsEasterEgg />
          </DetailsGrid>
        </CardBody>
      </CardContainer>
    </SettingsStack>
  );
};

export const SettingsPage: React.FC = () => (
  <TabsProvider initialTab={SETTINGS_TABS.appearance}>
    <SettingsTabsSection>
      <Tabs
        tabs={[
          { id: SETTINGS_TABS.appearance, label: "Appearance" },
          { id: SETTINGS_TABS.operations, label: "Platform Operations" },
          { id: SETTINGS_TABS.api, label: "API Explorer" },
        ]}
      />
      <SettingsTabContent />
    </SettingsTabsSection>
  </TabsProvider>
);
