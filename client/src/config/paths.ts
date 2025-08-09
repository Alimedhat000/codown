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
      path: '',
      getHref: () => '/app',
    },
    document: {
      path: 'doc/:id',
      getHref: (id: string) => `/app/doc/${id}`,
    },
    share: {
      path: 'doc/share/:token',
      getHref: (token: string) => `/app/doc/share/${token}`,
    },
  },
} as const;
