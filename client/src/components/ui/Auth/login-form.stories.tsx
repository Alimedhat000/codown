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

const onSubmitFn = fn();

export const Default: Story = {
  args: { onSubmit: onSubmitFn },
};

export const ValidationBlocksEmptySubmit: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
    await expect(onSubmitFn).not.toHaveBeenCalled();
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'user@test.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'secret123');
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
    await expect(onSubmitFn).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'secret123',
    });
  },
};

export const Loading: Story = {
  args: { onSubmit: onSubmitFn, isLoading: true },
};
