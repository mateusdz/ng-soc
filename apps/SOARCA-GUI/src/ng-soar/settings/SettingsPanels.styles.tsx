import styled from "styled-components";

import { CardBody } from "@/components";

export const SettingsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const SettingsTabsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const ServiceCardBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ServiceHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const ServiceTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const ServiceName = styled.strong`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
`;

export const ServiceRole = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;

export const ServiceDetails = styled.div`
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
`;

export const DetailLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font: ${({ theme }) => theme.typography.small.font};
`;

export const DetailValue = styled.span`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.caption.font};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ApiExplorerHeaderBody = styled(CardBody)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const ApiSwitcher = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.tertiary};
`;

export const ApiSwitchButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary.border : "transparent"};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary.bg : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
  cursor: pointer;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.hover};
  }
`;

export const ApiFrame = styled.iframe`
  width: 100%;
  height: calc(100vh - 15rem);
  min-height: 720px;
  border: 0;
`;
