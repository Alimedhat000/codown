import type { Meta, StoryObj } from '@storybook/react-vite';

import { DashboardLayout } from './dashboard-layout';

const meta: Meta<typeof DashboardLayout> = {
  title: 'Layouts/DashboardLayout',
  component: DashboardLayout,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DashboardLayout>;

export const Authenticated: Story = {
  args: {
    title: 'Dashboard',
    children: <div className="p-8 text-sm">Dashboard content.</div>,
  },
};

export const SignedOut: Story = {
  args: {
    title: 'Dashboard',
    children: <div className="p-8 text-sm">Dashboard content.</div>,
  },
  parameters: {
    auth: null,
  },
};

export const SessionLoading: Story = {
  args: {
    title: 'Dashboard',
    children: <div className="p-8 text-sm">Dashboard content.</div>,
  },
  parameters: {
    auth: { loading: true },
  },
};
