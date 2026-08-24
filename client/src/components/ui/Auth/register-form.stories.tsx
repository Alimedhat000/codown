import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import RegisterForm from './register-form';

const meta: Meta<typeof RegisterForm> = {
  title: 'Components/Auth/RegisterForm',
  component: RegisterForm,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RegisterForm>;

// Per-story fn() — a shared module-scope mock makes .not.toHaveBeenCalled()
// order-dependent (breaks under filtered reruns/retries).

export const Default: Story = {
  args: { onSubmit: fn() },
};

export const ValidationBlocksEmptySubmit: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /create account/i }),
    );
    // DOM proof, not just callback absence:
    await canvas.findByText(/invalid email/i);
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'new@test.com');
    await userEvent.type(canvas.getByLabelText('Username'), 'newuser');
    await userEvent.type(canvas.getByLabelText('Full Name'), 'New User');
    await userEvent.type(canvas.getByLabelText('Password'), 'longsecret1');
    await userEvent.click(
      canvas.getByRole('button', { name: /create account/i }),
    );
    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'new@test.com',
      username: 'newuser',
      fullName: 'New User',
      password: 'longsecret1',
    });
  },
};

export const Loading: Story = {
  args: { onSubmit: fn(), isLoading: true },
};
