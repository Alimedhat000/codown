import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router'; // FIX: wrap with router
import { fn } from 'storybook/test';

import Header from './header';

const meta: Meta<typeof Header> = {
  component: Header,
  title: 'Layout/Header',
  args: {
    logout: fn(),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    username: undefined,
  },
};

export const LoggedIn: Story = {
  args: {
    username: 'Ali Medhat',
    avatarUrl: 'https://avatar.iran.liara.run/public/boy',
  },
};

export const LoggedInWithoutImage: Story = {
  args: {
    username: 'Ali Medhat',
    avatarUrl: 'https://invalid.image.com',
  },
};
