import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    className: 'h-6 w-48',
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

export const Circle: Story = {
  args: {
    className: 'h-10 w-10 rounded-full',
  },
};

export const LargeBlock: Story = {
  args: {
    className: 'h-24 w-full',
  },
};

export const Custom: Story = {
  args: {
    className: 'h-8 w-72 bg-accent  animate-pulse rounded-lg',
  },
};
