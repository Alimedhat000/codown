import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import { WorkspaceInfo } from './workspace-info';

const meta: Meta = {
  title: 'DocumentPage/WorkspaceInfo',
  component: WorkspaceInfo,
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

export const Default: Story = {
  args: {},
};
