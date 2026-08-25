import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import NewDocumentFormBody from './new-document-form-body';

const meta: Meta<typeof NewDocumentFormBody> = {
  title: 'Common/NewDocumentFormBody',
  component: NewDocumentFormBody,
  tags: ['autodocs'],
  parameters: {
    modal: true,
  },
};
export default meta;

type Story = StoryObj<typeof NewDocumentFormBody>;

// Per-story fn() — a shared module-scope mock makes .not.toHaveBeenCalled()
// order-dependent (breaks under filtered reruns/retries).

export const Default: Story = {
  args: { onSubmit: fn() },
};

export const ValidationBlocksEmptyTitle: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));
    await expect(args.onSubmit).not.toHaveBeenCalled();
    // existence-based: robust against Radix open/close animation timing
    await canvas.findByText(/title is required/i);
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText('Document Title'),
      'Meeting notes',
    );
    await userEvent.click(canvas.getByRole('button', { name: /^create$/i }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      title: 'Meeting notes',
    });
  },
};

export const SubmittingState: Story = {
  args: {
    onSubmit: () => new Promise(() => {}), // never resolves — shows pending UI
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Document Title'), 'Slow doc');
    const createButton = canvas.getByRole('button', { name: /^create$/i });
    await userEvent.click(createButton);
    await expect(canvas.getByText(/creating\.\.\./i)).toBeVisible();
    await expect(createButton).toBeDisabled();
  },
};
