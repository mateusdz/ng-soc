import {
  Activity,
  FilePlusCorner,
  Home,
  LayoutDashboard,
  LucideIcon,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SquarePen,
  X,
} from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { PATHS } from "@/utils";
import ngSoarIconUrl from "../../../img/NG-SOAR_Icon.png";
import ngSoarLogoUrl from "../../../img/NG-SOAR_Logo.png";

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
  BrandImage,
  BrandLogo,
  ContentArea,
  MainContent,
  MainWrapper,
  MobileBrand,
  MobileLauncher,
  MobileMenuButton,
  NavText,
  Overlay,
  SidebarCollapseButton,
  SidebarHeaderRow,
  SidebarIconRailButton,
} from "./MainPage.styles";

interface NavRoute {
  path: string;
  label: string;
  tooltip: string;
  icon: LucideIcon;
}

const NAV_ROUTES: NavRoute[] = [
  {
    path: PATHS.DASHBOARD,
    label: "Dashboard",
    tooltip: "Dashboard: SOC operations overview",
    icon: Home,
  },
  {
    path: PATHS.PLAYBOOKS.BASE,
    label: "Playbooks",
    tooltip: "Playbooks: search, filter, and inspect CACAO playbooks",
    icon: LayoutDashboard,
  },
  {
    path: PATHS.ROASTER.BASE,
    label: "Playbook Editor",
    tooltip: "Playbook Editor: author and import CACAO playbooks",
    icon: SquarePen,
  },
  {
    path: PATHS.MONITORING.BASE,
    label: "Monitoring",
    tooltip: "Monitoring: review executions and manual input",
    icon: Activity,
  },
  {
    path: PATHS.SETTINGS,
    label: "Settings",
    tooltip: "Settings: platform status, API explorer, and appearance",
    icon: Settings,
  },
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
                title="NG-SOAR: NG-SOC console"
              >
                <BrandImage
                  $isCollapsed={!showSidebarLabels}
                  src={showSidebarLabels ? ngSoarLogoUrl : ngSoarIconUrl}
                  alt="NG-SOAR"
                />
              </BrandLogo>
            </SidebarLogoContainer>
          </SidebarHeaderRow>
          <SidebarIconRailButton
            $isCollapsed={!showSidebarLabels}
            onClick={() => handleNavigation(PATHS.PLAYBOOKS.NEW)}
            aria-label="New playbook: create a CACAO playbook"
            title="New playbook: create a CACAO playbook"
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
              aria-label={route.tooltip}
              title={route.tooltip}
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
          <SidebarCollapseButton
            $isCollapsed={!showSidebarLabels}
            aria-label={
              showSidebarLabels
                ? "Collapse sidebar: show icons only"
                : "Expand sidebar: show labels"
            }
            title={
              showSidebarLabels
                ? "Collapse sidebar: show icons only"
                : "Expand sidebar: show labels"
            }
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          >
            <Icon
              $icon={showSidebarLabels ? PanelLeftClose : PanelLeftOpen}
              $size={showSidebarLabels ? ThemeSize.Large : ThemeSize.ExtraLarge}
            />
            {showSidebarLabels ? <NavText>Collapse sidebar</NavText> : null}
          </SidebarCollapseButton>
        </SidebarFooter>
      </Sidebar>
      <ContentArea>
        <MobileLauncher>
          <MobileBrand>
            <BrandImage $isMobile src={ngSoarLogoUrl} alt="NG-SOAR" />
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
