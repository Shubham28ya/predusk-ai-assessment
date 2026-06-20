import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/ui/slider';
import React, { useState } from 'react';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

const SliderWithState = () => {
  const [val, setVal] = useState(50);
  return (
    <div className="w-64 space-y-4">
      <div className="text-sm font-medium">Value: {val}</div>
      <Slider min={0} max={100} value={val} onChange={(e: any) => setVal(Number(e.target.value))} />
    </div>
  );
};

export const Default: Story = {
  render: () => <SliderWithState />,
};
