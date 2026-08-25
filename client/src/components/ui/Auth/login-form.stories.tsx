import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import LoginForm from './login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Components/Auth/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof LoginForm>;

// Per-story fn() — a shared module-scope mock makes .not.toHaveBeenCalled()
// order-dependent (breaks under filtered reruns/retries).

export const Default: Story = {
  args: { onSubmit: fn() },
};

export const ValidationBlocksEmptySubmit: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
    // DOM proof, not just callback absence:
    await canvas.findByText(/invalid email/i);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'secret123');
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'secret123',
    });
  },
};

export const Loading: Story = {
  args: { onSubmit: fn(), isLoading: true },
};
