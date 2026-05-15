import { useQuery } from "@tanstack/react-query";
import { css, styled } from "styled-components";

import { getVariantColors, ThemeVariant } from "@/components/utils";
import { getPlatformHealth } from "@/ng-soar/api/platform";
import { theme } from "@/theme";
import { pulse } from "@/theme/animations";

export const StatusIndicator: React.FC = () => {
  const { data, isError, isFetching } = useQuery({
    queryKey: ["ng-soar-platform-health"],
    queryFn: getPlatformHealth,
    retry: 1,
    retryDelay: 500,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const isOnline = data?.status === "operational" && !isError;
  const isDegraded = data?.status === "degraded" && !isError;
  const isReconnecting = isFetching && !isOnline && !isDegraded;
  const unhealthyServices =
    data?.services.filter((service) => service.status !== "operational") ?? [];

  return (
    <StatusDot
      className="status-indicator" // needed to swap the order when in mobile view. See Main.tsx
      $isOnline={isOnline}
      $isDegraded={isDegraded || isReconnecting}
      title={
        isOnline
          ? "NG-SOAR platform healthy"
          : isDegraded
            ? `NG-SOAR platform degraded: ${unhealthyServices
                .map((service) => service.name)
                .join(", ")}`
            : isReconnecting
              ? "Checking NG-SOAR platform health..."
              : "NG-SOAR platform health unavailable"
      }
    />
  );
};

const StatusDot = styled.div<{
  $isOnline: boolean;
  $isDegraded: boolean;
}>`
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.full};

  background-color: ${({ $isOnline, $isDegraded }) =>
    $isOnline
      ? getVariantColors(theme, ThemeVariant.Success).solidBg
      : $isDegraded
        ? getVariantColors(theme, ThemeVariant.Warning).solidBg
        : getVariantColors(theme, ThemeVariant.Error).solidBg};

  animation: ${({ $isOnline, $isDegraded }) =>
    $isOnline || $isDegraded
      ? css`
          ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        `
      : "none"};
`;
