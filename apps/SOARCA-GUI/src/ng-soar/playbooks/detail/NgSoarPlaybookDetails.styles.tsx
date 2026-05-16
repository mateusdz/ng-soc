import styled from "styled-components";

export const DetailsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const HeroPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const HeroTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h2.font};
`;

export const HeroDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.body.font};
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SectionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SectionTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h4.font};
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

export const MonoValue = styled.code`
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.code_small.font};
  word-break: break-all;
`;

export const MutedValue = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const InlineBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const SummaryDefinitionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const SummaryDefinition = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 2.25rem;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: help;
  font: ${({ theme }) => theme.typography.caption.font};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font: ${({ theme }) => theme.typography.caption.font};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &::after {
    position: absolute;
    z-index: 10;
    bottom: calc(100% + ${({ theme }) => theme.spacing.xs});
    left: 0;
    display: block;
    width: max-content;
    max-width: 22rem;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border: 1px solid ${({ theme }) => theme.colors.border.medium};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
    color: ${({ theme }) => theme.colors.text.secondary};
    content: attr(data-tooltip);
    font: ${({ theme }) => theme.typography.caption.font};
    opacity: 0;
    pointer-events: none;
    transform: translateY(0.25rem);
    transition:
      opacity ${({ theme }) => theme.transitions.base},
      transform ${({ theme }) => theme.transitions.base};
    white-space: normal;
  }

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.info.border};
  }

  &:hover::after,
  &:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const SummaryStatus = styled.span<{ $detected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `0 ${theme.spacing.sm}`};
  border: 1px solid
    ${({ $detected, theme }) =>
      $detected ? theme.colors.success.border : theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ $detected, theme }) =>
    $detected ? theme.colors.success.bg : theme.colors.background.primary};
  color: ${({ $detected, theme }) =>
    $detected ? theme.colors.success.text : theme.colors.text.tertiary};
  font: ${({ theme }) => theme.typography.small.font};
  white-space: nowrap;

  &::before {
    content: "";
    width: 0.45rem;
    height: 0.45rem;
    flex: 0 0 0.45rem;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ $detected, theme }) =>
      $detected ? theme.colors.success.solidBg : theme.colors.text.tertiary};
  }
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

export const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.small.font};
`;

export const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h3.font};
`;

export const MeterTrack = styled.div`
  height: 0.5rem;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.colors.background.primary};
`;

export const MeterFill = styled.div<{ $value: number; $variant: "error" | "warning" | "info" }>`
  width: ${({ $value }) => `${Math.max(0, Math.min($value, 100))}%`};
  height: 100%;
  background: ${({ $variant, theme }) => theme.colors[$variant].solidBg};
`;

export const ReferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const ReferenceItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const Disclosure = styled.details`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};

  summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.primary};
    font: ${({ theme }) => theme.typography.bodyMedium.font};
  }
`;

export const ObjectPreview = styled.pre`
  max-height: 18rem;
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.code_small.font};
`;

export const CountGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const CountItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;
