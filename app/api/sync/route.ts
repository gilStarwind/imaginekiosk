import { NextResponse } from 'next/server';
import { getSettings, saveMissions } from '../../../lib/data';
import { Mission } from '../../../lib/types';

function parseLinks(input?: string) {
  if (!input) return [];
  return input
    .split(';')
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map((pair) => {
      const [label, href] = pair.split('|');
      return {
        label: (label || 'Open').trim(),
        href: (href || '#').trim()
      };
    });
}

function parseCsv(text: string): Mission[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const result: Mission[] = [];
  
  const splitCsv = (str: string) => {
    const arr = [];
    let quote = false;
    let col = "";
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === '"') {
            if (quote && str[i+1] === '"') {
                col += '"';
                i++;
            } else {
                quote = !quote;
            }
        }
        else if (c === ',' && !quote) {
            arr.push(col.trim());
            col = "";
        } else {
            col += c;
        }
    }
    arr.push(col.trim());
    return arr;
  };

  const headers = splitCsv(lines[0]!.toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const row = splitCsv(lines[i]!);
    const record: any = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] || '';
    });
    
    if (!record.title) continue;

    result.push({
      id: record.id || record.title?.toLowerCase().replace(/\s+/g, '-') || String(Math.random()).slice(2),
      title: record.title || '',
      subtitle: record.subtitle || '',
      focus: record.focus || '',
      involved: record.involved || '',
      contact: record.contact || '',
      body: record.body || '',
      image: record.image || '',
      links: parseLinks(record.links || '')
    });
  }
  return result;
}

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const settings = await getSettings();
    if (!settings.sheetUrl) {
      return NextResponse.json({ ok: false, error: 'No Sheet URL configured' }, { status: 400 });
    }

    // Auto-transform standard Google Sheets viewing links to CSV export links 
    let fetchUrl = settings.sheetUrl;
    if (fetchUrl.includes('docs.google.com/spreadsheets') && fetchUrl.includes('/edit')) {
      fetchUrl = fetchUrl.replace(/\/[eE]dit.*$/, '/export?format=csv');
    }

    const response = await fetch(fetchUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const remoteMissions = parseCsv(text);
    
    if (remoteMissions.length > 0) {
      await saveMissions(remoteMissions);
      return NextResponse.json({ ok: true, data: remoteMissions });
    } else {
      return NextResponse.json({ ok: false, error: 'Parsed sheet was empty' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Background sync failed:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
