import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    children: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default variant and size.
 */
export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'default',
    size: 'default',
  },
};

/**
 * Destructive variant for irreversible actions.
 */
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

/**
 * Outline variant.
 */
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

/**
 * Secondary variant.
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

/**
 * Ghost variant.
 */
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

/**
 * Link-styled variant.
 */
export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

/**
 * Small size preset.
 */
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
};

/**
 * Large size preset.
 */
export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
};

/**
 * Icon-only ghost button using size='icon'.
 */
export const IconButton: Story = {
  args: {
    children: '🔔',
    size: 'icon',
    variant: 'ghost',
  },
};
