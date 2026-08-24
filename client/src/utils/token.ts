let accessToken: string | null = null;

/**
 * Store the access token in module scope for the axios interceptor.
 */
export const setAccessToken = (token: string) => {
  accessToken = token;
};

/**
 * Current access token, or null when signed out.
 */
export const getAccessToken = () => accessToken;

/**
 * Clear the stored access token.
 */
export const clearAccessToken = () => {
  accessToken = null;
};
