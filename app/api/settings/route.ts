import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '../../../lib/data';
import { Settings } from '../../../lib/types';

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const settings = (await request.json()) as Settings;
    await saveSettings(settings);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
