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

const onSubmitFn = fn();

export const Default: Story = {
  args: { onSubmit: onSubmitFn },
};

export const ValidationBlocksEmptyTitle: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));
    await expect(onSubmitFn).not.toHaveBeenCalled();
    // existence-based: the modal entrance animation makes visibility racy
    await canvas.findByText(/title is required/i);
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText('Document Title'),
      'Meeting notes',
    );
    await userEvent.click(canvas.getByRole('button', { name: /^create$/i }));
    await expect(onSubmitFn).toHaveBeenCalledWith({ title: 'Meeting notes' });
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
