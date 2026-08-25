import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentLayout } from './document-layout';

const meta: Meta<typeof DocumentLayout> = {
  title: 'Layouts/DocumentLayout',
  component: DocumentLayout,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DocumentLayout>;

export const Default: Story = {
  args: {
    title: 'My Document',
    children: (
      <div className="flex h-full items-center justify-center p-8 text-sm">
        Full-height document surface.
      </div>
    ),
  },
};
