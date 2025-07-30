import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, AvatarImage, AvatarFallback } from './avatar';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: 'Components/Avatar',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/300?img=12" alt="Ali Medhat" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://this-image-does-not-exist.jpg" alt="Broken" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const CustomSize: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src="https://i.pravatar.cc/300?img=15" alt="Ali Medhat" />
    </Avatar>
  ),
};
