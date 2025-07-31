import { createBrowserRouter, Outlet } from 'react-router';
import { RouterProvider } from 'react-router';

import { paths } from '@/config/paths';
import { ProtectedRoute } from '@/lib/auth';

import { ErrorBoundary as AppRootErrorBoundary } from './routes/app/error-boundary';

const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.landing.path,
      lazy: () =>
        import('./routes/landing').then((mod) => ({ Component: mod.default })),
    },
    {
      path: paths.auth.login.path,
      lazy: () =>
        import('./routes/auth/login').then((mod) => ({
          Component: mod.default,
        })),
    },
    {
      path: paths.auth.register.path,
      lazy: () =>
        import('./routes/auth/register').then((mod) => ({
          Component: mod.default,
        })),
    },
    {
      path: paths.app.home.path,
      element: (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      ),
      ErrorBoundary: AppRootErrorBoundary,
      children: [
        {
          path: paths.app.dashboard.path,
          lazy: () =>
            import('./routes/app/dashboard').then((mod) => ({
              Component: mod.default,
            })),
        },
        {
          path: paths.app.document.path,
          lazy: () =>
            import('./routes/app/document').then((mod) => ({
              Component: mod.default,
            })),
        },
      ],
    },
    {
      path: '*',
      lazy: () =>
        import('./routes/not-found').then((mod) => ({
          Component: mod.default,
        })),
    },
  ]);

export function AppRouter() {
  const router = createAppRouter();
  return <RouterProvider router={router} />;
}
