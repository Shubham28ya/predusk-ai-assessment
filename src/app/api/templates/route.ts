import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function GET() {
  const templates = [
    { id: '1', name: 'Summarize Text', prompt: 'Summarize the following text in 3 sentences:\n\n[Insert text here]' },
    { id: '2', name: 'Code Review', prompt: 'Review the following code and suggest improvements for performance and readability:\n\n```javascript\n\n```' },
    { id: '3', name: 'Creative Writing', prompt: 'Write a short story about a time traveler who gets stuck in the year 2026.' },
  ];

  return NextResponse.json(templates);
}
