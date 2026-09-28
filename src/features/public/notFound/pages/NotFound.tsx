import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PublicPageFrame from "@/shared/components/Layouts/PublicPageFrame";
import { adminRoutes, isAdminPath } from "@/shared/routing/adminRoutes";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const isAdminPage = isAdminPath(pathname);

  return (
    <PublicPageFrame
      number="404"
      eyebrow="Page not found"
      title="This page isn’t here."
      description="The address may have changed, or the link may be outdated. Choose a page below to continue."
    >
      <div className="flex flex-wrap gap-3">
        <Link
          to={isAdminPage ? adminRoutes.dashboard : "/"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {isAdminPage ? "Admin dashboard" : "Back to home"}
        </Link>
        <Link
          to={isAdminPage ? adminRoutes.projects : "/projects"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm text-ink/75 transition-colors hover:border-teal-500/45 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          {isAdminPage ? "Manage projects" : "Browse projects"}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
      <p className="break-all font-mono text-xs text-ink/45" role="status">
        Requested path: {pathname}
      </p>
    </PublicPageFrame>
  );
}
