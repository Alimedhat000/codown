// Todo: add the landing page to the home path and
// Todo: move all the app paths to app/**

export const paths = {
  home: {
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
    dashboard: { path: '/dashboard/docs', getHref: () => '/dashboard/docs' },
    document: {
      path: '/dashboard/docs/:id',
      getHref: (id: string) => `/dashboard/docs/${id}`,
    },
  },
} as const;
