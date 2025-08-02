import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShareButton } from './share-button';

const meta: Meta = {
  title: 'DocumentPage/ShareButton',
  component: ShareButton,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
