import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from './toast'; // Adjust the path based on where your toast file is

const meta: Meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const DefaultToast: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);

    return (
      <ToastProvider>
        <button
          onClick={() => setOpen(true)}
          className="mb-4 rounded bg-black px-4 py-2 text-white"
        >
          Show Toast
        </button>
        <Toast open={open} onOpenChange={setOpen} variant="default">
          <div className="flex flex-col space-y-1">
            <ToastTitle>Default Toast</ToastTitle>
            <ToastDescription>
              This is a default toast message.
            </ToastDescription>
          </div>
          <ToastAction altText="Undo">Undo</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [openVariant, setOpenVariant] = React.useState<
      'default' | 'destructive' | 'success' | 'warning' | null
    >(null);

    const variants = ['default', 'destructive', 'success', 'warning'] as const;

    return (
      <ToastProvider>
        <div className="flex gap-2 flex-wrap mb-4">
          {variants.map((v) => (
            <button
              key={v}
              onClick={() => setOpenVariant(v)}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Show {v}
            </button>
          ))}
        </div>

        {variants.map((v) => (
          <Toast
            key={v}
            open={openVariant === v}
            onOpenChange={(open) => open || setOpenVariant(null)}
            variant={v}
          >
            <div className="flex flex-col space-y-1">
              <ToastTitle>
                {v.charAt(0).toUpperCase() + v.slice(1)} Toast
              </ToastTitle>
              <ToastDescription>This is a {v} toast message.</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}

        <ToastViewport />
      </ToastProvider>
    );
  },
};
