import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Forward to questions endpoint POST which has the seed logic
  try {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/arena/questions`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
