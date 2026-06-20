import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function GET() {
  const models = [
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 (8B)', provider: 'Groq' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 (70B)', provider: 'Groq' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 (9B)', provider: 'Groq' },
  ];

  return NextResponse.json(models);
}
