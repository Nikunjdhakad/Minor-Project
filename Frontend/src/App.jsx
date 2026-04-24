import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import AppLayout from "./layouts/AppLayout";

// Code-split all pages with React.lazy
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const TryOnStudio = lazy(() => import("./pages/TryOnStudio"));
const ProfileSetupPage = lazy(() => import("./pages/ProfileSetupPage"));
const SearchHistoryPage = lazy(() => import("./pages/SearchHistoryPage"));

// Loading fallback for lazy pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  return <LazyPage>{children}</LazyPage>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LazyPage><LandingPage /></LazyPage> },
      { path: "login", element: <LazyPage><LoginPage /></LazyPage> },
      { path: "signup", element: <LazyPage><LoginPage isSignup /></LazyPage> },
      { path: "dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: "upload", element: <LazyPage><UploadPage /></LazyPage> },
      { path: "studio", element: <LazyPage><TryOnStudio /></LazyPage> },
      { path: "recommendations", element: <LazyPage><RecommendationsPage /></LazyPage> },
      { path: "profile-setup", element: <ProtectedRoute><ProfileSetupPage /></ProtectedRoute> },
      { path: "history", element: <ProtectedRoute><SearchHistoryPage /></ProtectedRoute> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;