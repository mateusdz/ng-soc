import styled from "styled-components";

export const DetailsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
`;

export const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.body.font};
  word-break: break-word;
`;

export const MutedValue = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const InlineBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;
