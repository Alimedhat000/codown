import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  LuAlignJustify as RowsIcon,
  LuGrid2X2 as GridIcon,
} from 'react-icons/lu';

import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue="grid"
      aria-label="View toggle"
      className="bg-surface border-surface-border inline-flex gap-1 rounded-md border p-1"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <GridIcon size={20} />
      </ToggleGroupItem>
      <ToggleGroupItem value="row" aria-label="Row view">
        <RowsIcon size={20} />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
