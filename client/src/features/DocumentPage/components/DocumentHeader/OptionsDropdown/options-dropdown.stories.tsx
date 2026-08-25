import type { Meta, StoryObj } from '@storybook/react-vite';

import { MoreOptionsDropdown } from './options-dropdown';

const meta: Meta = {
  title: 'DocumentPage/OptionsDropdown',
  component: MoreOptionsDropdown,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

/**
 * More-options menu.
 */
export const Default: Story = {
  args: {},
};
