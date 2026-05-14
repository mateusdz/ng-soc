import styled from "styled-components";

export const PlaybookToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SavedViewRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SavedViewButton = styled.button<{ $active?: boolean }>`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.primary.border : theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary.bg : theme.colors.background.primary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary.hover : theme.colors.text.secondary};
  cursor: pointer;
  font: ${({ theme }) => theme.typography.caption.font};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.border};
    color: ${({ theme }) => theme.colors.primary.hover};
    background: ${({ theme }) => theme.colors.primary.bg};
  }
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
