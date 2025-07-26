// Todo: add the landing page to the home path and
// Todo: move all the app paths to app/**

export const paths = {
  landing: {
    path: '/',
    getHref: () => '/',
  },
  auth: {
    login: {
      path: '/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/login${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
        }`,
    },
    register: {
      path: '/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/register${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
        }`,
    },
  },
  app: {
    home: { path: '/app', getHref: () => '/app' },
    dashboard: {
      path: 'dashboard/docs',
      getHref: () => '/app/dashboard/docs',
    },
    document: {
      path: 'dashboard/docs/:id',
      getHref: (id: string) => `/app/dashboard/docs/${id}`,
    },
  },
} as const;
