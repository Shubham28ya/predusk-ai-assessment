import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '@/components/ui/chat-bubble';
import React from 'react';

const meta: Meta<typeof ChatBubble> = {
  title: 'UI/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const UserMessage: Story = {
  args: {
    role: 'user',
    content: 'Explain quantum computing in simple terms.',
  },
};

export const AssistantMessage: Story = {
  args: {
    role: 'assistant',
    content: 'Imagine a coin spinning in the air. A regular computer uses bits that are like a coin sitting on a table—it is either Heads (1) or Tails (0). Quantum computers use qubits, which exist in a state of both at the same time.',
  },
};

export const TypingIndicator: Story = {
  args: {
    role: 'assistant',
    isTyping: true,
    content: <span className="animate-pulse">Deep thinking...</span>,
  },
};
