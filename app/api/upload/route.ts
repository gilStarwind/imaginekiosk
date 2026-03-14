import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetDir = formData.get('target') as string || 'missions'; // 'missions' or 'general'

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate targetDir to prevent traversal
    const safeTargetDir = targetDir === 'general' ? 'general' : 'missions';
    const uploadDir = path.join(process.cwd(), 'public', 'images', safeTargetDir);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Use original filename or generate a clean one
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = path.join(uploadDir, safeFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    return NextResponse.json({ 
      ok: true, 
      url: `/images/${safeTargetDir}/${safeFilename}` 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
