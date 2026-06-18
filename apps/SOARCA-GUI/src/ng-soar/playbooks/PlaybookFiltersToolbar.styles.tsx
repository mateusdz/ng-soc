/*
 * Copyright (c) 2026 Cyentific AS.
 * All Rights Reserved.
 *
 * This file is part of the Cyentific CACAO Platform.
 * Unauthorized copying, modification, distribution, or commercial use is prohibited.
 */

import styled from "styled-components";

export const PlaybookToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(5, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  align-items: end;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterField = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.small.font};
`;

export const FilterSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font: ${({ theme }) => theme.typography.caption.font};
`;
