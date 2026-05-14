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

export const MainHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  min-height: 2rem;

  @media (max-width: 768px) {
    .mobile-menu {
      order: 1;
    }
    .status-indicator {
      order: 2;
    }
  }
`;

export const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 550px;
  background-color: ${({ theme }) => theme.colors.secondary.bg};
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

export const BrandLogo = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
`;

export const BrandIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme }) => theme.colors.primary.text};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.palette.primary},
    ${({ theme }) => theme.colors.palette.secondary}
  );
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const BrandText = styled.div`
  min-width: 0;
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
