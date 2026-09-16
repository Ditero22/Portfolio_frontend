import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuthSession } from "../../../features/auth/hooks/useAuthSession";

const primaryNavigation = [
  { label: "Blog", path: "/blog" },
  { label: "Gear", path: "/gear" },
  { label: "Resources", path: "/resources" },
];

const secondaryNavigation = [
  { label: "Projects", path: "/projects" },
  { label: "Experience", path: "/experience" },
  { label: "Stack", path: "/stack" },
  { label: "Certification", path: "/certification" },
  { label: "Recommendation", path: "/recommendation" },
];

const tertiaryNavigation = [
  { label: "Mode", path: "/sample" },
  { label: "Dark / Light", path: "/sample" },
  { label: "Sample", path: "/sample" },
  { label: "Sample", path: "/sample" },
  { label: "Email", path: "/sample" },
];

const adminNavigation = [
  { label: "Dashboard", path: "/admin", end: true },
  { label: "Blog", path: "/admin/manage/blog" },
  { label: "Projects", path: "/admin/manage/projects" },
  { label: "Skills", path: "/admin/manage/skills" },
  { label: "Certifications", path: "/admin/manage/certifications" },
  { label: "Recommendations", path: "/admin/manage/recommendations" },
  { label: "Messages", path: "/admin/manage/messages" },
];

interface SidebarNavLinkProps {
  label: string;
  path: string;
  end?: boolean;
  onClick?: () => void;
}

interface NavigationListProps {
  items: {
    label: string;
    path: string;
    end?: boolean;
  }[];
  onClick?: () => void;
}

function SidebarNavLink({
  label,
  path,
  end = false,
  onClick,
}: SidebarNavLinkProps) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-2 py-1 text-sm transition duration-200 ${
          isActive
            ? "text-white"
            : "text-white/60 hover:bg-white/[0.06] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span>→</span>}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NavigationList({
  items,
  onClick,
}: NavigationListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <SidebarNavLink
          key={item.path}
          label={item.label}
          path={item.path}
          end={item.end}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

function LogoutButton({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onLogout}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm text-white/60 transition duration-200 hover:bg-white/[0.06] hover:text-white"
    >
      <span>→</span>
      <span>Logout</span>
    </button>
  );
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuthSession();

  const isAdmin = location.pathname.startsWith("/admin");
  const sidebarTitle = isAdmin ? "Admin" : "Diether";

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed left-0 top-0 z-[100] flex h-12 w-full items-center border-b border-white/10 bg-[#020202] px-3 md:hidden">
        <NavLink
          to={isAdmin ? "/admin" : "/"}
          end
          onClick={closeMobileMenu}
          className="text-xl text-white transition hover:text-white/70"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {sidebarTitle}
        </NavLink>

        <button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          className="absolute right-4 flex h-6 w-6 items-center justify-center text-2xl text-white transition hover:text-white/70"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? "×" : "☰"}
        </button>
      </header>

      <div
        className={`
          fixed left-0 top-12 z-[90]
          flex h-[calc(100dvh-3rem)] w-full flex-col
          overflow-hidden
          bg-[#020202]
          transition-transform duration-500 ease-in-out
          md:hidden
          ${isOpen ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {isAdmin ? (
          <>
            <nav className="flex-1 px-6 py-6">
              <NavigationList
                items={adminNavigation}
                onClick={closeMobileMenu}
              />
            </nav>

            <div className="shrink-0 border-t border-white/10 px-6 py-4">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </>
        ) : (
          <>
            {/* Mobile Primary + Secondary */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <NavigationList
                items={primaryNavigation}
                onClick={closeMobileMenu}
              />

              <div className="h-6" />

              <NavigationList
                items={secondaryNavigation}
                onClick={closeMobileMenu}
              />
            </nav>

            <div className="shrink-0 border-t border-white/10 px-6 py-4">
              <NavigationList
                items={tertiaryNavigation}
                onClick={closeMobileMenu}
              />
            </div>
          </>
        )}
      </div>

      <aside
        className="
          fixed left-0 top-0 z-50
          hidden h-screen w-60
          flex-col
          border-r border-white/10
          bg-[#020202]/70
          px-6 py-8
          md:flex
        "
      >
        <div className="mb-6 shrink-0">
          <NavLink
            to={isAdmin ? "/admin" : "/"}
            end
            className="text-2xl text-white transition hover:text-white/70"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {sidebarTitle}
          </NavLink>
        </div>

        {isAdmin ? (
          <>
            {/* Admin Navigation */}
            <nav className="flex-1">
              <NavigationList items={adminNavigation} />
            </nav>

            {/* Admin Logout */}
            <div className="mt-6 shrink-0 border-t border-white/10 pt-4">
              <LogoutButton onLogout={handleLogout} />
            </div>
          </>
        ) : (
          <>
            <nav className="sidebar-scroll h-[45%] overflow-y-auto pr-1">
              <NavigationList items={primaryNavigation} />

              <div className="h-6" />

              <NavigationList items={secondaryNavigation} />
            </nav>

            {/* Public Tertiary Navigation */}
            <div className="mt-2 shrink-0 border-t border-white/10 pt-3">
              <NavigationList items={tertiaryNavigation} />
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default Sidebar; 