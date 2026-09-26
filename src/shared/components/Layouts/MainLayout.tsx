import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import PublicPresence from "@/features/public/analytics/components/PublicPresence";

function MainLayout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-grid absolute inset-0" />
      </div>

      <Sidebar />
      {!isAdmin && <PublicPresence />}

      <main className="relative z-10 min-h-screen md:ml-60">
        <div className="mx-auto min-h-screen w-full max-w-6xl px-6 pt-24 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
