/*
 * Copyright (c) 2026 Cyentific AS.
 * All Rights Reserved.
 *
 * This file is part of the Cyentific CACAO Platform.
 * Unauthorized copying, modification, distribution, or commercial use is prohibited.
 */

import styled, { type DefaultTheme } from "styled-components";

export type StatusTone = "success" | "info" | "warning" | "error" | "neutral";

function statusTextColor(tone: StatusTone, theme: DefaultTheme) {
  switch (tone) {
    case "success":
      return theme.colors.success.text;
    case "info":
      return theme.colors.info.text;
    case "warning":
      return theme.colors.warning.text;
    case "error":
      return theme.colors.error.text;
    default:
      return theme.colors.text.secondary;
  }
}

function statusDotColor(tone: StatusTone, theme: DefaultTheme) {
  switch (tone) {
    case "success":
      return theme.colors.success.solidBg;
    case "info":
      return theme.colors.info.solidBg;
    case "warning":
      return theme.colors.warning.solidBg;
    case "error":
      return theme.colors.error.solidBg;
    default:
      return theme.colors.text.tertiary;
  }
}

export const ResultsTableViewport = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const PlaybookNameText = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
`;

export const PlaybookDescriptionText = styled.div`
  max-width: 28rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: -webkit-box;
  font: ${({ theme }) => theme.typography.caption.font};
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

export const StatusStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 8rem;
`;

export const StatusText = styled.span<{ $tone: StatusTone }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ $tone, theme }) => statusTextColor($tone, theme)};
  font: ${({ theme }) => theme.typography.caption.font};
  line-height: 1.2;
  white-space: nowrap;

  &::before {
    content: "";
    width: 0.45rem;
    height: 0.45rem;
    flex: 0 0 0.45rem;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ $tone, theme }) => statusDotColor($tone, theme)};
  }
`;

export const MutedText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;

export const BadgeGroup = styled.div`
  display: flex;
  max-width: 18rem;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const LabelChip = styled.span`
  display: inline-flex;
  align-items: center;
  max-width: 9rem;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.small.font};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TypeText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
`;

export const AuthorText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.caption.font};
  word-break: break-word;
`;

export const ActionCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SortHeaderButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

export const RiskStack = styled.div`
  display: grid;
  min-width: 7rem;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const RiskLine = styled.div`
  display: grid;
  grid-template-columns: 3.75rem 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.small.font};
`;

export const RiskBarTrack = styled.div`
  height: 0.4rem;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.colors.background.secondary};
  overflow: hidden;
`;

export const RiskBar = styled.span<{ $value: number; $variant: "error" | "warning" | "info" }>`
  display: block;
  height: 100%;
  width: ${({ $value }) => `${Math.max(0, Math.min($value, 5)) * 20}%`};
  background: ${({ $variant, theme }) => theme.colors[$variant].solidBg};
`;
