import styled from "styled-components";

export const MainWrapper = styled.div`
  height: 100vh;
  display: flex;
  overflow: hidden;
`;

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 550px;
  background-color: ${({ theme }) => theme.colors.secondary.bg};

  @media (max-width: 768px) {
    padding-top: 4.5rem;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;

  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const MobileLauncher = styled.div`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    top: ${({ theme }) => theme.spacing.md};
    left: ${({ theme }) => theme.spacing.md};
    right: ${({ theme }) => theme.spacing.md};
    z-index: ${({ theme }) => theme.zIndex.sticky};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.background.overlay};
    z-index: ${({ theme }) => theme.zIndex.overlay};
  }
`;

export const BrandLogo = styled.div<{ $isCollapsed?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "100%")};
  min-height: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "3rem")};
`;

export const SidebarHeaderRow = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) =>
    $isCollapsed ? "center" : "space-between"};
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const SidebarCollapseButton = styled.button<{ $isCollapsed?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $isCollapsed, theme }) => ($isCollapsed ? "0" : theme.spacing.sm)};
  width: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "100%")};
  height: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "2.75rem")};
  flex: 0 0 auto;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.border};
    color: ${({ theme }) => theme.colors.primary.hover};
    background: ${({ theme }) => theme.colors.primary.bg};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const SidebarIconRailButton = styled.button<{ $isCollapsed: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $isCollapsed, theme }) => ($isCollapsed ? "0" : theme.spacing.sm)};
  width: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "100%")};
  height: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "auto")};
  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? "0" : `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.info.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.info.solidBg};
  color: ${({ theme }) => theme.colors.info.solidText};
  cursor: pointer;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background: ${({ theme }) => theme.colors.info.text};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SidebarDocsLink = styled.a<{ $isCollapsed: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $isCollapsed, theme }) => ($isCollapsed ? "0" : theme.spacing.md)};
  width: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "auto")};
  height: ${({ $isCollapsed }) => ($isCollapsed ? "3.25rem" : "auto")};
  padding: ${({ $isCollapsed, theme }) =>
    $isCollapsed ? "0" : `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  text-decoration: none;
  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => `${theme.colors.primary.main}26`};
  }
`;

export const BrandIcon = styled.div<{ $isCollapsed?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $isCollapsed }) => ($isCollapsed ? "3rem" : "2.5rem")};
  height: ${({ $isCollapsed }) => ($isCollapsed ? "3rem" : "2.5rem")};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.primary.text};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.palette.primary},
    ${({ theme }) => theme.colors.palette.secondary}
  );
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const BrandImage = styled.img<{
  $isCollapsed?: boolean;
  $isMobile?: boolean;
}>`
  display: block;
  width: ${({ $isCollapsed, $isMobile }) =>
    $isMobile ? "9rem" : $isCollapsed ? "3.25rem" : "100%"};
  max-width: ${({ $isCollapsed, $isMobile }) =>
    $isMobile ? "9rem" : $isCollapsed ? "3.25rem" : "13.5rem"};
  height: ${({ $isCollapsed, $isMobile }) =>
    $isMobile ? "2.5rem" : $isCollapsed ? "3.25rem" : "3.75rem"};
  object-fit: contain;
`;

export const BrandText = styled.div`
  min-width: 0;
`;

export const NavText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BrandTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h3.font};
  line-height: 1.1;
`;

export const BrandSubtitle = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font: ${({ theme }) => theme.typography.small.font};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const MobileBrand = styled.div`
  display: none;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h4.font};

  @media (max-width: 768px) {
    display: flex;
  }
`;
