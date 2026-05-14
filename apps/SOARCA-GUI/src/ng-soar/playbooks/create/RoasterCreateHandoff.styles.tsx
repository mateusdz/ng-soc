import styled from "styled-components";

export const HandoffPanel = styled.section<{ $tone: "info" | "success" }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "success" ? theme.colors.success.border : theme.colors.info.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme, $tone }) =>
    $tone === "success" ? theme.colors.success.bg : theme.colors.info.bg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const HandoffContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;
`;

export const HandoffIcon = styled.div<{ $tone: "info" | "success" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: ${({ theme }) => theme.size["2xl"]};
  height: ${({ theme }) => theme.size["2xl"]};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme, $tone }) =>
    $tone === "success" ? theme.colors.success.text : theme.colors.info.text};
  background: ${({ theme }) => theme.colors.background.primary};
`;

export const HandoffText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

export const HandoffTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
`;

export const HandoffDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.body.font};
`;

export const PlaybookReference = styled.code`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.code_medium.font};
  word-break: break-word;
`;

export const HandoffActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;
