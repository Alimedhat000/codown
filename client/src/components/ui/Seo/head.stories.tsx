import type { Meta, StoryObj } from '@storybook/react-vite';

import { Head } from './head';

const meta: Meta<typeof Head> = {
  title: 'Components/Seo/Head',
  component: Head,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Head>;

/** Renders head metadata without crashing; inspect the document head to verify. */
export const Default: Story = {};

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Storybook Page Title',
    description: 'Meta description set from a story.',
  },
};
