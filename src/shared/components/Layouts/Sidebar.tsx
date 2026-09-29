import {
  Award,
  Bookmark,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Menu,
  Monitor,
  Newspaper,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuthSession } from "../../../features/auth/hooks/useAuthSession";
import ThemeToggle from "../../theme/ThemeToggle";
import { Modal } from "../ui";
import SocialLinks from "./SocialLinks";
import { adminRoutes, isAdminPath } from "../../routing/adminRoutes";

const primaryNavigation = [
  { label: "Blog", path: "/blog", icon: Newspaper },
  { label: "Gear", path: "/gear", icon: Monitor },
  { label: "Resources", path: "/resources", icon: Bookmark },
];

const secondaryNavigation = [
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Experience", path: "/experience", icon: BriefcaseBusiness },
  { label: "Stack", path: "/stack", icon: Layers3 },
  { label: "Certifications", path: "/certifications", icon: Award },
  { label: "Recommendations", path: "/recommendations", icon: MessageSquareQuote },
  { label: "Skills", path: "/skills", icon: Code2 },
];

const adminNavigation = [
  { label: "Dashboard", path: adminRoutes.dashboard, end: true, icon: LayoutDashboard },
  { label: "Blog", path: adminRoutes.blog, icon: Newspaper },
  { label: "Resources", path: adminRoutes.resources, icon: Bookmark },
  { label: "Projects", path: adminRoutes.projects, icon: FolderKanban },
  { label: "Experience", path: adminRoutes.experience, icon: BriefcaseBusiness },
  { label: "Stack", path: adminRoutes.stack, icon: Layers3 },
  { label: "Certifications", path: adminRoutes.certifications, icon: Award },
  { label: "Recommendations", path: adminRoutes.recommendations, icon: MessageSquareQuote },
  { label: "Skills", path: adminRoutes.skills, icon: Code2 },
  { label: "Settings", path: adminRoutes.settings, icon: Settings },
];

interface SidebarNavLinkProps {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  onClick?: () => void;
}

interface NavigationListProps {
  label: string;
  items: {
    label: string;
    path: string;
    icon: LucideIcon;
    end?: boolean;
  }[];
  onClick?: () => void;
}

function SidebarNavLink({
  label,
  path,
  icon: Icon,
  end = false,
  onClick,
}: SidebarNavLinkProps) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `sidebar-nav-link${isActive ? " is-active" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          <span className="sidebar-nav-link__icon">
            <Icon
              size={15}
              strokeWidth={isActive ? 2 : 1.7}
              aria-hidden="true"
            />
          </span>
          <span className="sidebar-nav-link__label">{label}</span>
          {isActive && <span className="sidebar-nav-link__marker" />}
        </>
      )}
    </NavLink>
  );
}

function NavigationList({ label, items, onClick }: NavigationListProps) {
  return (
    <section className="sidebar-nav-group">
      <p className="sidebar-nav-group__label">{label}</p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <SidebarNavLink
            key={item.path}
            label={item.label}
            path={item.path}
            icon={item.icon}
            end={item.end}
            onClick={onClick}
          />
        ))}
      </div>
    </section>
  );
}

function SidebarBrand({ isAdmin }: { isAdmin: boolean }) {
  const title = isAdmin ? "Admin" : "Diether";

  return (
    <NavLink
      to={isAdmin ? adminRoutes.dashboard : "/"}
      end
      className={`sidebar-brand${isAdmin ? "" : " sidebar-brand--public"}`}
      aria-label={`${title} home`}
    >
      <span className="sidebar-brand__mark">D</span>
      <span className="sidebar-brand__copy">
        {isAdmin && (
          <span className="sidebar-brand__eyebrow">PRIVATE WORKSPACE</span>
        )}
        <span className="sidebar-brand__name">{title}</span>
        {isAdmin && (
          <span className="sidebar-brand__caption">Content studio</span>
        )}
      </span>
      <span className="sidebar-brand__arrow" aria-hidden="true">↗</span>
    </NavLink>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="sidebar-nav-link sidebar-nav-link--button"
    >
      <span className="sidebar-nav-link__icon">
        <LogOut size={15} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="sidebar-nav-link__label">Logout</span>
    </button>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthSession();
  const isAdmin = isAdminPath(location.pathname);

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const requestLogout = () => {
    setIsLogoutConfirmationOpen(true);
  };

  const confirmLogout = () => {
    logout();
    closeMobileMenu();
    setIsLogoutConfirmationOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <header className="sidebar-mobile-header fixed left-0 top-0 z-[100] flex h-12 w-full items-center justify-between px-3 md:hidden">
        <NavLink
          to={isAdmin ? adminRoutes.dashboard : "/"}
          end
          onClick={closeMobileMenu}
          className="sidebar-mobile-brand"
        >
          <span className="sidebar-mobile-brand__mark">D</span>
          <span>{isAdmin ? "Admin" : "Diether"}</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="sidebar-mobile-menu-button grid h-11 w-11 shrink-0 place-items-center"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? (
            <X size={19} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <Menu size={19} strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </header>

      <div
        id="mobile-navigation"
        className="sidebar-mobile-menu fixed left-0 top-12 z-[90] flex h-[calc(100dvh-3rem)] w-full flex-col overflow-hidden md:hidden"
        data-open={isOpen}
        aria-hidden={!isOpen}
        inert={!isOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeMobileMenu();
        }}
      >
        {isAdmin ? (
          <nav className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <NavigationList
              label="Workspace"
              items={adminNavigation}
              onClick={closeMobileMenu}
            />
          </nav>
        ) : (
          <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <NavigationList
              label="Navigate"
              items={primaryNavigation}
              onClick={closeMobileMenu}
            />
            <NavigationList
              label="Explore the portfolio"
              items={secondaryNavigation}
              onClick={closeMobileMenu}
            />
          </nav>
        )}

        <div className="sidebar-mobile-footer shrink-0 px-6 py-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="sidebar-footer-label">Appearance</span>
            <ThemeToggle />
          </div>
          {isAdmin ? (
            <LogoutButton onLogout={requestLogout} />
          ) : (
            <SocialLinks />
          )}
        </div>
      </div>

      <aside className="portfolio-sidebar fixed left-0 top-0 z-50 hidden h-screen w-60 flex-col px-5 py-6 md:flex">
        <SidebarBrand isAdmin={isAdmin} />

        <nav className="sidebar-scroll mt-7 min-h-0 flex-1 overflow-y-auto pr-1">
          {isAdmin ? (
            <NavigationList label="Workspace" items={adminNavigation} />
          ) : (
            <>
              <NavigationList label="Navigate" items={primaryNavigation} />
              <NavigationList
                label="Explore the portfolio"
                items={secondaryNavigation}
              />
            </>
          )}
        </nav>

        <div className="sidebar-desktop-footer mt-5 shrink-0 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="sidebar-footer-label">Appearance</span>
            <ThemeToggle />
          </div>
          {isAdmin ? (
            <LogoutButton onLogout={requestLogout} />
          ) : (
            <SocialLinks />
          )}
          <div className="sidebar-footer-signature">
            <span>DESIGNED & BUILT</span>
            <span>BUILT FOR REAL USE <span aria-hidden="true">✳</span></span>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={isLogoutConfirmationOpen}
        onClose={() => setIsLogoutConfirmationOpen(false)}
        title="Confirm logout"
        size="sm"
      >
        <div className="space-y-5 text-ink">
          <p>Are you sure you want to sign out of your admin session?</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutConfirmationOpen(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm transition hover:bg-ink/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Log out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Sidebar;
