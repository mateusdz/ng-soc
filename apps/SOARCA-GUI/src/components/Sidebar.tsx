import styled from "styled-components";

type SidebarWidth = "compact" | "normal" | "wide";

const sidebarWidths: Record<SidebarWidth, string> = {
  compact: "200px",
  normal: "280px",
  wide: "350px",
};

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  $isOpen: boolean;
  $isCollapsed?: boolean;
  $maxWidth?: SidebarWidth;
}

/**
 * Sidebar component with responsive behavior and customizable max-width.
 * The sidebar will always attempt to fit its content but will not exceed the specified max-width.
 * @param $isOpen - Controls sidebar visibility on mobile (default: false)
 * @param $maxWidth - Sidebar max-width: "compact" | "normal" | "wide" (default: "normal")
 */
export const Sidebar = styled.aside<SidebarProps>`
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  width: ${({ $isCollapsed }) => ($isCollapsed ? "5.5rem" : "280px")};
  max-width: ${({ $maxWidth = "normal" }) => sidebarWidths[$maxWidth]};

  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? theme.spacing.md : theme.spacing.lg};

  border-right: 1px solid ${({ theme }) => theme.colors.border.light};

  background-color: ${({ theme }) => theme.colors.background.primary};

  transition:
    width ${({ theme }) => theme.transitions.slow},
    padding ${({ theme }) => theme.transitions.slow};

  @media (max-width: 768px) {
    position: fixed;
    width: 280px;
    padding: ${({ theme }) => theme.spacing.lg};
    left: 0;
    top: 0;
    bottom: 0;
    z-index: ${({ theme }) => theme.zIndex.sticky};
    transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "-100%")});
    transition: transform ${({ theme }) => theme.transitions.slow};
  }
`;

export const SidebarHeader = styled.div<{ $isCollapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "stretch")};

  gap: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? theme.spacing.md : theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.xl};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const SidebarNav = styled.nav<{ $isCollapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "stretch")};

  gap: ${({ theme }) => theme.spacing.md};
`;

export const SidebarLogoContainer = styled.div<{ $isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? `${theme.spacing.sm} 0` : theme.spacing.md};
`;

/**
 * Navigation item within the sidebar.
 * Highlights when active and changes appearance on hover.
 * @param $isActive - Whether the nav item is currently active (default: false)
 */
export const NavItem = styled.a<{ $isActive?: boolean; $isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "flex-start")};

  font: ${({ theme }) => theme.typography.bodyMedium.font};

  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;

  width: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "auto")};
  height: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "auto")};
  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? "0" : `${theme.spacing.sm} ${theme.spacing.lg}`};
  gap: ${({ $isCollapsed, theme }) => ($isCollapsed ? "0" : theme.spacing.md)};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => `${theme.colors.primary.main}26`};
  }

  ${({ $isActive, theme }) =>
    $isActive
      ? `
        color: ${theme.colors.primary.hover};
        background-color: ${theme.colors.primary.hover}33;`
      : ""}
`;

export const SidebarFooter = styled.div<{ $isCollapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed
      ? `${theme.spacing.md} 0 0`
      : `${theme.spacing.md} ${theme.spacing.md} 0 ${theme.spacing.md}`};

  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  margin-top: auto;
`;

export const SidebarFooterLink = styled.a`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;

  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => `${theme.colors.primary.main}26`};
  }
`;
