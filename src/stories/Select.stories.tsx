import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '@/components/ui/select';
import React from 'react';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option value="1">Llama 3.1 (8B)</option>
        <option value="2">Mixtral 8x7B</option>
        <option value="3">Gemma 2</option>
      </>
    ),
  },
};
