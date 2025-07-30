import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SortControl } from './sort-control';

const meta: Meta = {
  title: 'Dashboard/SortControl',
  component: SortControl,
};
export default meta;

type Story = StoryObj;

const sortOptions = [
  { label: 'New To Old', value: 'newest' },
  { label: 'Old To New', value: 'oldest' },
  { label: 'A to Z', value: 'az' },
  { label: 'Z to A', value: 'za' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('newest');
    return (
      <SortControl
        onChange={(val) => {
          setValue(val);
        }}
        options={sortOptions}
        value={value}
      />
    );
  },
};
