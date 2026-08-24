import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShareButton } from './share-button';

const meta: Meta = {
  title: 'DocumentPage/ShareButton',
  component: ShareButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

/**
 * Button opening the share dialog.
 */
export const Default: Story = {
  args: {},
};
