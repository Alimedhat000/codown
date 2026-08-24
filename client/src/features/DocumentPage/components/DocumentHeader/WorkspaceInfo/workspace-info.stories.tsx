import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { WorkspaceInfo } from './workspace-info';

const meta: Meta = {
  title: 'DocumentPage/WorkspaceInfo',
  component: WorkspaceInfo,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: (Story) => (
    <MemoryRouter>
      <Story />
    </MemoryRouter>
  ),
};
export default meta;

type Story = StoryObj;

/**
 * Workspace badge display.
 */
export const Default: Story = {
  args: {},
};
