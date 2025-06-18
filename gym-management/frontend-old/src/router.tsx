import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy load page components
const MembersPage = lazy(() => import('./pages/MembersPage'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // In a real app, you would check for authentication here
  const isAuthenticated = true; // Replace with actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Route configuration
const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="members" replace />,
      },
      {
        path: 'members',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <MembersPage />
          </Suspense>
        ),
      },
      {
        path: 'packages',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <PackagesPage />
          </Suspense>
        ),
      },
      {
        path: 'calendar',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

// Create the router instance
export const router = createBrowserRouter(routes);

// Export the routes for use in tests or other modules
export default routes;
