import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from './alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'success', 'warning', 'info'],
    },
    onDismiss: { action: 'dismissed' },
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Heads up!',
    children: 'This is an informational alert.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your operation was completed successfully.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Caution!',
    children: 'This action might have unintended consequences.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Something went wrong',
    children: 'There was a problem processing your request.',
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'Dismiss me',
    children: 'Click the close button to dismiss this alert.',
    onDismiss: () => console.log('Alert dismissed'),
  },
};
