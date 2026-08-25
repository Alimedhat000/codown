import type { Meta, StoryObj } from '@storybook/react-vite';

import ContentLayout from './content-layout';

const meta: Meta<typeof ContentLayout> = {
  title: 'Layouts/ContentLayout',
  component: ContentLayout,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ContentLayout>;

export const Default: Story = {
  args: {
    title: 'Content Page',
    children: <div className="p-8 text-sm">Page content.</div>,
  },
};
