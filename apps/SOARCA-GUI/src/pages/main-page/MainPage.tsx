import {
  Activity,
  BookOpen,
  FilePlusCorner,
  Home,
  LayoutDashboard,
  LucideIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  SquarePen,
  X,
} from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { PATHS, SOARCA_DOC_URL } from "@/utils";

import {
  Icon,
  NavItem,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarLogoContainer,
  SidebarNav,
  ThemeSize,
} from "@/components";

import {
  BrandIcon,
  BrandLogo,
  BrandSubtitle,
  BrandText,
  BrandTitle,
  ContentArea,
  MainContent,
  MainWrapper,
  MobileBrand,
  MobileLauncher,
  MobileMenuButton,
  NavText,
  Overlay,
  SidebarCollapseButton,
  SidebarDocsLink,
  SidebarHeaderRow,
  SidebarIconRailButton,
} from "./MainPage.styles";

interface NavRoute {
  path: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ROUTES: NavRoute[] = [
  { path: PATHS.DASHBOARD, label: "Dashboard", icon: Home },
  {
    path: PATHS.PLAYBOOKS.BASE,
    label: "Playbooks",
    icon: LayoutDashboard,
  },
  { path: PATHS.ROASTER.BASE, label: "Playbook Editor", icon: SquarePen },
  { path: PATHS.MONITORING.BASE, label: "Monitoring", icon: Activity },
  { path: PATHS.SETTINGS, label: "Settings", icon: Settings },
];

export const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const showSidebarLabels = sidebarOpen || !sidebarCollapsed;

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <MainWrapper>
      <Overlay $isOpen={sidebarOpen} onClick={closeSidebar} />
      <Sidebar $isOpen={sidebarOpen} $isCollapsed={sidebarCollapsed}>
        <SidebarHeader $isCollapsed={!showSidebarLabels}>
          <SidebarHeaderRow $isCollapsed={!showSidebarLabels}>
            <SidebarLogoContainer $isCollapsed={!showSidebarLabels}>
              <BrandLogo
                $isCollapsed={!showSidebarLabels}
                aria-label="NG-SOAR"
                title="NG-SOAR"
              >
                <BrandIcon $isCollapsed={!showSidebarLabels}>
                  <Icon
                    $icon={ShieldCheck}
                    $size={showSidebarLabels ? ThemeSize.Large : ThemeSize.ExtraLarge}
                  />
                </BrandIcon>
                {showSidebarLabels ? (
                  <BrandText>
                    <BrandTitle>NG-SOAR</BrandTitle>
                    <BrandSubtitle>NG-SOC Console</BrandSubtitle>
                  </BrandText>
                ) : null}
              </BrandLogo>
            </SidebarLogoContainer>
            {showSidebarLabels ? (
              <SidebarCollapseButton
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                type="button"
                onClick={() => setSidebarCollapsed(true)}
              >
                <Icon $icon={PanelLeftClose} $size={ThemeSize.Medium} />
              </SidebarCollapseButton>
            ) : null}
          </SidebarHeaderRow>
          {!showSidebarLabels ? (
            <SidebarCollapseButton
              $isCollapsed
              aria-label="Expand sidebar"
              title="Expand sidebar"
              type="button"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Icon $icon={PanelLeftOpen} $size={ThemeSize.ExtraLarge} />
            </SidebarCollapseButton>
          ) : null}
          <SidebarIconRailButton
            $isCollapsed={!showSidebarLabels}
            onClick={() => handleNavigation(PATHS.PLAYBOOKS.NEW)}
            aria-label="New playbook"
            title="New playbook"
            type="button"
          >
            <Icon
              $icon={FilePlusCorner}
              $size={showSidebarLabels ? ThemeSize.Large : ThemeSize.ExtraLarge}
            />
            {showSidebarLabels ? <NavText>New playbook</NavText> : null}
          </SidebarIconRailButton>
        </SidebarHeader>
        <SidebarNav $isCollapsed={!showSidebarLabels}>
          {NAV_ROUTES.map((route) => (
            <NavItem
              key={route.path}
              $isCollapsed={!showSidebarLabels}
              $isActive={
                location.pathname === route.path ||
                (route.path === PATHS.MONITORING.BASE &&
                  location.pathname.includes(PATHS.MONITORING.BASE)) ||
                (route.path === PATHS.PLAYBOOKS.BASE &&
                  location.pathname.includes(PATHS.PLAYBOOKS.BASE)) ||
                (route.path === PATHS.ROASTER.BASE &&
                  location.pathname.includes(PATHS.ROASTER.BASE))
              }
              onClick={() => handleNavigation(route.path)}
              aria-label={route.label}
              title={route.label}
            >
              <Icon
                $icon={route.icon}
                $size={showSidebarLabels ? ThemeSize.Large : ThemeSize.ExtraLarge}
              />
              {showSidebarLabels ? <NavText>{route.label}</NavText> : null}
            </NavItem>
          ))}
        </SidebarNav>
        <SidebarFooter $isCollapsed={!showSidebarLabels}>
          <SidebarDocsLink
            $isCollapsed={!showSidebarLabels}
            href={SOARCA_DOC_URL}
            target="_blank"
            rel="help noopener noreferrer"
            aria-label="Docs"
            title="Docs"
          >
            <Icon
              $icon={BookOpen}
              $size={showSidebarLabels ? ThemeSize.Large : ThemeSize.ExtraLarge}
            />
            {showSidebarLabels ? <NavText>Docs</NavText> : null}
          </SidebarDocsLink>
        </SidebarFooter>
      </Sidebar>
      <ContentArea>
        <MobileLauncher>
          <MobileBrand>
            <BrandIcon>
              <Icon $icon={ShieldCheck} />
            </BrandIcon>
            NG-SOAR
          </MobileBrand>
          <MobileMenuButton onClick={sidebarOpen ? closeSidebar : openSidebar}>
            {sidebarOpen ? (
              <Icon $icon={X} $size={ThemeSize.ExtraLarge} />
            ) : (
              <Icon $icon={Menu} $size={ThemeSize.ExtraLarge} />
            )}
          </MobileMenuButton>
        </MobileLauncher>
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentArea>
    </MainWrapper>
  );
};
