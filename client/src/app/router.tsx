import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { paths } from '@/config/paths';

const createAppRouter = () =>
  createBrowserRouter([
    {
      path: paths.home.path,
      lazy: () =>
        import('./routes/app/home').then((mod) => ({ Component: mod.default })),
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
