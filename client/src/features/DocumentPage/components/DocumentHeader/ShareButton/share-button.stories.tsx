import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShareButton } from './share-button';

const meta: Meta = {
  title: 'DocumentPage/ShareButton',
  component: ShareButton,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
