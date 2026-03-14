import { NextResponse } from 'next/server';
import { getMissions, saveMissions } from '../../../lib/data';
import { Mission } from '../../../lib/types';

export async function GET() {
  const missions = await getMissions();
  return NextResponse.json(missions);
}

export async function POST(request: Request) {
  try {
    const missions = (await request.json()) as Mission[];
    await saveMissions(missions);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
