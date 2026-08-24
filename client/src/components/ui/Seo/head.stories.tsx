import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Head } from './head';
const meta: Meta<typeof Head> = {
  title: 'Components/Seo/Head',
  component: Head,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Head>;

/** Renders no canvas DOM (Helmet writes to <head>); falls back to 'Codown'. */
export const Default: Story = {
  play: async () => {
    await waitFor(() => expect(document.title).toBe('Codown'));
  },
};

export const WithTitleAndDescription: Story = {
  args: {
    title: 'Storybook Page Title',
    description: 'Meta description set from a story.',
  },
  play: async () => {
    // Helmet writes outside the canvas; assert against the document head.
    await waitFor(() => expect(document.title).toBe('Storybook Page Title'));
    await waitFor(() =>
      expect(
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute('content'),
      ).toBe('Meta description set from a story.'),
    );
  },
};
