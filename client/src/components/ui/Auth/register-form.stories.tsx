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

const onSubmitFn = fn();

export const Default: Story = {
  args: { onSubmit: onSubmitFn },
};

export const ValidationBlocksEmptySubmit: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getAllByRole('button').find((b) => b.type === 'submit')!,
    );
    await expect(onSubmitFn).not.toHaveBeenCalled();
  },
};

export const SuccessfulSubmission: Story = {
  args: { onSubmit: onSubmitFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'new@test.com');
    await userEvent.type(canvas.getByLabelText('Username'), 'newuser');
    await userEvent.type(canvas.getByLabelText('Full Name'), 'New User');
    await userEvent.type(canvas.getByLabelText('Password'), 'longsecret1');
    await userEvent.click(
      canvas.getAllByRole('button').find((b) => b.type === 'submit')!,
    );
    await expect(onSubmitFn).toHaveBeenCalledWith({
      email: 'new@test.com',
      username: 'newuser',
      fullName: 'New User',
      password: 'longsecret1',
    });
  },
};

export const Loading: Story = {
  args: { onSubmit: onSubmitFn, isLoading: true },
};
