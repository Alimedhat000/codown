import type { Decorator, Preview } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { Modal } from '@/components/ui/Modal';
import { AuthContext, type AuthContextType } from '@/context/auth/auth-context';
import type { User } from '@/types/api';
import '../src/index.css';

const mockUser: User = {
  id: 'story-user-1',
  email: 'story@example.com',
  username: 'storyuser',
  fullName: 'Story User',
};

const defaultAuth: AuthContextType = {
  user: mockUser,
  accessToken: 'storybook-access-token',
  isAuthenticated: true,
  loading: false,
  login: () => {},
  logout: async () => {},
};

/**
 * Wraps every story in a router and an authenticated auth context.
 * Override per story via parameters.auth (partial AuthContextType, or
 * `null` to render the signed-out state).
 */
const withRouterAndAuth: Decorator = (Story, context) => {
  const override = context.parameters.auth;
  const value =
    override === null
      ? {
          ...defaultAuth,
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }
      : override
        ? { ...defaultAuth, ...override }
        : defaultAuth;
  return (
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <Story />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

/**
 * Opt-in modal ancestor for components that emit ModalContent parts
 * directly (e.g. NewDocumentFormBody). Enable via parameters.modal = true.
 */
const withOptionalModal: Decorator = (Story, context) => {
  if (!context.parameters.modal) return <Story />;
  return (
    <Modal open onOpenChange={() => {}}>
      <Story />
    </Modal>
  );
};

const preview: Preview = {
  decorators: [withRouterAndAuth, withOptionalModal],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#18181b' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark' },
  },
};

export default preview;
