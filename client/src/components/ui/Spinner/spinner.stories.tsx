import type { Meta, StoryObj } from '@storybook/react-vite';

import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl' },
};

export const LightVariantOnDark: Story = {
  args: { variant: 'light' },
  parameters: {
    backgrounds: { value: 'dark' },
  },
};
