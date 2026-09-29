import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PublicPresence from "@/features/public/analytics/components/PublicPresence";
import { isAdminPath } from "@/shared/routing/adminRoutes";

function MainLayout() {
  const { pathname } = useLocation();
  const isAdmin = isAdminPath(pathname);

  useLayoutEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-grid absolute inset-0" />
      </div>

      <Sidebar />
      {!isAdmin && <PublicPresence />}

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 min-h-screen outline-none md:ml-60"
      >
        <div
          className={`mx-auto min-h-screen w-full max-w-6xl px-4 sm:px-6 ${
            isAdmin
              ? "pb-8 pt-16 md:px-8 md:py-8"
              : "pt-20 md:px-10 md:py-10"
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
