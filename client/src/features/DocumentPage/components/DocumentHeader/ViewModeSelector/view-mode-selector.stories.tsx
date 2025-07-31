import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ViewModeSelector } from './view-mode-selector';

const meta: Meta = {
  title: 'DocumentPage/ViewModeSelector',
  component: ViewModeSelector,
  parameters: {
    layout: 'centered',
  },
  args: {
    setMode: fn(),
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
