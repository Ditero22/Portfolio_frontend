import { Suspense, lazy, type ReactNode } from "react";
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./features/auth/context/AuthProvider";
import PageSkeleton from "./shared/components/Loading/PageSkeleton";
import ProtectedRoute from "./shared/ProtectedRoute";
import MainLayout from "./shared/components/Layouts/MainLayout";

const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));

const LandingPage = lazy(() => import("./features/public/landingPage"));

const BlogPage = lazy(() => import("./features/public/blog/pages/Blog"));
const BlogPostPage = lazy(
  () => import("./features/public/blog/pages/BlogPost"),
);
const GearPage = lazy(() => import("./features/public/gear"));
const ResourcesPage = lazy(() => import("./features/public/resources"));
const ProjectsPage = lazy(() => import("./features/public/projects"));
const ProjectManagement = lazy(
  () => import("./features/admin/manage/projects"),
);
const ExperiencePage = lazy(() => import("./features/public/experience"));
const ExperienceManagement = lazy(
  () => import("./features/admin/manage/experience"),
);
const AdminDashboard = lazy(() => import("./features/admin/dashboard"));
const StackPage = lazy(() => import("./features/public/stack"));
const CertificationsPage = lazy(
  () => import("./features/public/certifications"),
);
const RecommendationsPage = lazy(
  () => import("./features/public/recommendations"),
);
const SkillsPage = lazy(() => import("./features/public/skills"));
const StackManagement = lazy(() => import("./features/admin/manage/stack"));
const CertificationsManagement = lazy(
  () => import("./features/admin/manage/certifications"),
);
const RecommendationsManagement = lazy(
  () => import("./features/admin/manage/recommendations"),
);
const SkillsManagement = lazy(() => import("./features/admin/manage/skills"));
const SettingsManagement = lazy(
  () => import("./features/admin/manage/settings"),
);

const BlogManagement = lazy(
  () => import("./features/admin/manage/blog/pages/BlogManagement"),
);

function withSuspense(
  element: ReactNode,
  fallback: ReactNode = <PageSkeleton />,
) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
}

function createRoute(path: string, element: ReactNode) {
  return {
    path,
    element: withSuspense(element),
  };
}

function createProtectedRoute(
  path: string,
  element: ReactNode,
  fallback: ReactNode = <PageSkeleton />,
) {
  return {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path,
        element: withSuspense(element, fallback),
      },
    ],
  };
}

function NotFoundRedirect() {
  const location = useLocation();

  const destination = location.pathname.startsWith("/admin") ? "/admin" : "/";

  return (
    <Navigate
      to={destination}
      replace
    />
  );
}

const router = createBrowserRouter([
  createRoute("/login", <LoginPage />),

  {
    element: <MainLayout />,
    children: [
      createRoute("/", <LandingPage />),
      createRoute("/blog", <BlogPage />),
      createRoute("/blog/:slug", <BlogPostPage />),
      createRoute("/gear", <GearPage />),
      createRoute("/resources", <ResourcesPage />),
      createRoute("/projects", <ProjectsPage />),
      createRoute("/experience", <ExperiencePage />),
      createRoute("/stack", <StackPage />),
      createRoute("/certifications", <CertificationsPage />),
      createRoute("/recommendations", <RecommendationsPage />),
      createRoute("/skills", <SkillsPage />),

      createProtectedRoute("/admin", <AdminDashboard />),
      createProtectedRoute("/admin/manage/blog", <BlogManagement />),
      createProtectedRoute("/admin/manage/projects", <ProjectManagement />),
      createProtectedRoute(
        "/admin/manage/experience",
        <ExperienceManagement />,
      ),
      createProtectedRoute("/admin/manage/stack", <StackManagement />),
      createProtectedRoute(
        "/admin/manage/certifications",
        <CertificationsManagement />,
      ),
      createProtectedRoute(
        "/admin/manage/recommendations",
        <RecommendationsManagement />,
      ),
      createProtectedRoute("/admin/manage/skills", <SkillsManagement />),
      createProtectedRoute("/admin/settings", <SettingsManagement />),
    ],
  },

  {
    path: "*",
    element: <NotFoundRedirect />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
