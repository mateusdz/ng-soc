import styled from "styled-components";

export const RoasterPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const RoasterHeader = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 768px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const RoasterHeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const RoasterTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const RoasterIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.warning.text};
  background: ${({ theme }) => theme.colors.warning.bg};
`;

export const RoasterTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h3.font};
`;

export const RoasterDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;

export const RoasterContextBar = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.tertiary};

  @media (max-width: 768px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const RoasterContextMain = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const RoasterContextLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
`;

export const RoasterContextValue = styled.code`
  overflow: hidden;
  max-width: min(42rem, 70vw);
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.code_small.font};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RoasterContextActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const RoasterFrameShell = styled.section`
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const RoasterFrame = styled.iframe`
  display: block;
  width: 100%;
  height: calc(100vh - 11rem);
  min-height: 620px;
  border: 0;
`;

export const RoasterLoadingOverlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  z-index: 1;
`;
