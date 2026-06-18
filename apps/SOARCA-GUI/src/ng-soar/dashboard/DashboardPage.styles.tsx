/*
 * Copyright (c) 2026 Cyentific AS.
 * All Rights Reserved.
 *
 * This file is part of the Cyentific CACAO Platform.
 * Unauthorized copying, modification, distribution, or commercial use is prohibited.
 */

import styled from "styled-components";

import { CardBody, CardContainer } from "@/components";

export const DashboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const DashboardHeaderActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled(CardContainer)``;

export const MetricCardBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const MetricLabel = styled.span`
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const MetricValue = styled.strong`
  font: ${({ theme }) => theme.typography.h2.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const MetricCaption = styled.span`
  min-height: 1.25rem;
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(20rem, 0.85fr);
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const CardContentStack = styled(CardBody)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const DashboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const DashboardListItem = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.tertiary};

  text-align: left;
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.transitions.base},
    box-shadow ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.border};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const DashboardListMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

export const DashboardListTitle = styled.strong`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DashboardListMeta = styled.span`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px dashed ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};

  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
  text-align: center;
`;

export const StatusRows = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatusRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  &:last-child {
    border-bottom: none;
  }
`;

export const StatusLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;

export const StatusValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  text-align: right;
`;
