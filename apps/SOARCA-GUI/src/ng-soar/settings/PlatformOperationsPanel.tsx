import { useQuery } from "@tanstack/react-query";
import React from "react";

import {
  Badge,
  CardContainer,
  CardHeader,
  CardTitle,
  SuspenseCard,
  Text,
  ThemeVariant,
} from "@/components";
import {
  getPlatformHealth,
  PlatformServiceHealth,
  PlatformServiceStatus,
} from "@/ng-soar/api/platform";
import { formatDateTime } from "@/utils";

import {
  DetailLabel,
  DetailValue,
  ServiceCardBody,
  ServiceDetails,
  ServiceGrid,
  ServiceHeader,
  ServiceName,
  ServiceRole,
  ServiceTitleGroup,
  SettingsStack,
} from "./SettingsPanels.styles";

function serviceVariant(status: PlatformServiceStatus) {
  switch (status) {
    case "operational":
      return ThemeVariant.Success;
    case "degraded":
      return ThemeVariant.Warning;
    case "down":
      return ThemeVariant.Error;
    default:
      return ThemeVariant.Secondary;
  }
}

function serviceStatusLabel(status: PlatformServiceStatus) {
  switch (status) {
    case "operational":
      return "Operational";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
    default:
      return status;
  }
}

const ServiceCard: React.FC<{ service: PlatformServiceHealth }> = ({
  service,
}) => (
  <CardContainer>
    <ServiceCardBody>
      <ServiceHeader>
        <ServiceTitleGroup>
          <ServiceName>{service.name}</ServiceName>
          <ServiceRole>{service.role}</ServiceRole>
        </ServiceTitleGroup>
        <Badge $variant={serviceVariant(service.status)}>
          {serviceStatusLabel(service.status)}
        </Badge>
      </ServiceHeader>
      <ServiceDetails>
        <DetailLabel>Endpoint</DetailLabel>
        <DetailValue title={service.url}>{service.url}</DetailValue>
        <DetailLabel>Last check</DetailLabel>
        <DetailValue>{formatDateTime(service.checkedAt, true)}</DetailValue>
        <DetailLabel>Latency</DetailLabel>
        <DetailValue>
          {typeof service.latencyMs === "number" ? `${service.latencyMs}ms` : "—"}
        </DetailValue>
        <DetailLabel>Details</DetailLabel>
        <DetailValue title={service.details}>{service.details ?? "—"}</DetailValue>
      </ServiceDetails>
    </ServiceCardBody>
  </CardContainer>
);

export const NgSoarPlatformOperationsPanel: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ng-soar-platform-health"],
    queryFn: getPlatformHealth,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  return (
    <SettingsStack>
      <SuspenseCard
        $isLoading={isLoading}
        $isError={isError}
        $errorMessage={
          error instanceof Error
            ? error.message
            : "Unable to load platform health."
        }
      >
        <CardContainer>
          <CardHeader>
            <CardTitle>Platform Operations</CardTitle>
            <Badge $variant={data ? serviceVariant(data.status) : ThemeVariant.Info}>
              {data ? serviceStatusLabel(data.status) : "Checking"}
            </Badge>
          </CardHeader>
          <ServiceCardBody>
            <Text>
              Component health across the NG-SOAR deployment. The header status
              indicator uses this platform summary; the old green dot only
              represented SOARCA ping health.
            </Text>
            <Text>
              Last platform check:{" "}
              {data?.checkedAt ? formatDateTime(data.checkedAt, true) : "—"}
            </Text>
          </ServiceCardBody>
        </CardContainer>

        <ServiceGrid>
          {(data?.services ?? []).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ServiceGrid>
      </SuspenseCard>
    </SettingsStack>
  );
};
