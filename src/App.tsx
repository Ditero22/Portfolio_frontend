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

const LoginPage = lazy(
  () => import("./features/auth/pages/LoginPage"),
);

const LandingPage = lazy(
  () => import("./features/public/landingPage"),
);

const BlogPage = lazy(
  () => import("./features/public/blog/pages/Blog"),
);
const BlogPostPage = lazy(
  () => import("./features/public/blog/pages/BlogPost"),
);
const AdminDashboard = lazy(
  () => import("./features/admin/dashboard"),
);

const BlogManagement = lazy(
  () => import("./features/admin/manage/blog/pages/BlogManagement"),
);

function withSuspense(
  element: ReactNode,
  fallback: ReactNode = <PageSkeleton />,
) {
  return (
    <Suspense fallback={fallback}>
      {element}
    </Suspense>
  );
}

function createRoute(
  path: string,
  element: ReactNode,
) {
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
    element: (
      <ProtectedRoute allowedRoles={["admin"]} />
    ),
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

  const destination = location.pathname.startsWith("/admin")
    ? "/admin"
    : "/";

  return <Navigate to={destination} replace />;
}

const router = createBrowserRouter([
  createRoute("/login", <LoginPage />),

  {
    element: <MainLayout />,
    children: [
      createRoute("/", <LandingPage />),
      createRoute("/blog", <BlogPage />),
      createRoute("/blog/:slug", <BlogPostPage />),

      createProtectedRoute(
        "/admin",
        <AdminDashboard />,
      ),
      createProtectedRoute(
        "/admin/manage/blog",
        <BlogManagement />,
      ),
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