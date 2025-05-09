import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ElevenLabs API key' }, { status: 500 });
  }
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/history', {
      headers: {
        'xi-api-key': apiKey,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch history from ElevenLabs' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 