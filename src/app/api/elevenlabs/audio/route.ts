import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing ElevenLabs API key' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const history_item_id = searchParams.get('history_item_id');
  if (!history_item_id) {
    return NextResponse.json({ error: 'Missing history_item_id' }, { status: 400 });
  }
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/history/${history_item_id}/audio`, {
      headers: {
        'xi-api-key': apiKey,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch audio from ElevenLabs' }, { status: res.status });
    }
    const audioBuffer = await res.arrayBuffer();
    return new NextResponse(Buffer.from(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 