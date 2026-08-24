import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ViewModeSelector } from './view-mode-selector';

const meta: Meta = {
  title: 'DocumentPage/ViewModeSelector',
  component: ViewModeSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    setMode: fn(),
  },
};
export default meta;

type Story = StoryObj;

/**
 * Edit/preview mode toggle group.
 */
export const Default: Story = {
  args: {},
};
