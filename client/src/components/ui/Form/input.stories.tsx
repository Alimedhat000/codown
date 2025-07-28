import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    error: {
      control: false, // handled via custom object
    },
    registration: {
      control: false, // it's a function from RHF, mocked manually
    },
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'ghost', 'unstyled'],
    },
  },
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    registration: {}, // no-op for controlled story
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Unstyled: Story = {
  args: {
    variant: 'unstyled',
  },
};

export const WithError: Story = {
  args: {
    error: {
      type: 'manual',
      message: 'Email is required',
    },
  },
};
