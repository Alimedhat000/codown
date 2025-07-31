import type { Meta, StoryObj } from '@storybook/react-vite';

import { WorkspaceInfo } from './workspace-info';

const meta: Meta = {
  title: 'DocumentPage/WorkspaceInfo',
  component: WorkspaceInfo,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
