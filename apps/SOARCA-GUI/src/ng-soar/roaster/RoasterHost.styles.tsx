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

export const RoasterFrameShell = styled.section`
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
