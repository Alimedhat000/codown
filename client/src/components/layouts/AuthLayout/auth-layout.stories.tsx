import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthLayout } from './auth-layout';

const meta: Meta<typeof AuthLayout> = {
  title: 'Layouts/AuthLayout',
  component: AuthLayout,
  tags: ['autodocs'],
  parameters: {
    auth: null,
  },
};
export default meta;

type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {
  args: {
    title: 'Sign in to Codown',
    error: null,
    children: <div className="p-4 text-sm">Auth form goes here.</div>,
  },
};

export const WithError: Story = {
  args: {
    title: 'Sign in to Codown',
    error: 'Invalid email or password.',
    children: <div className="p-4 text-sm">Auth form goes here.</div>,
  },
};
