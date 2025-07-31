import type { Meta, StoryObj } from '@storybook/react-vite';

import { MoreOptionsDropdown } from './options-dropdown';

const meta: Meta = {
  title: 'DocumentPage/OptionsDropdown',
  component: MoreOptionsDropdown,
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};
