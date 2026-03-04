import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier invalide (max 3MB)' }, { status: 400 });
    }

    const extension = ALLOWED_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Format non supporté (jpg/png/webp)' }, { status: 400 });
    }

    const oldUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(avatarsDir, { recursive: true });

    const filename = `${session.user.id}-${Date.now()}.${extension}`;
    const absolutePath = path.join(avatarsDir, filename);
    const publicPath = `/uploads/avatars/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const detectedType = detectImageType(buffer);
    if (!detectedType || detectedType !== file.type) {
      return NextResponse.json({ error: 'Le contenu du fichier ne correspond pas au format déclaré.' }, { status: 400 });
    }
    await writeFile(absolutePath, buffer);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: publicPath },
    });

    if (oldUser?.image && oldUser.image.startsWith('/uploads/avatars/')) {
      const oldPath = path.join(process.cwd(), 'public', oldUser.image.replace(/^\//, ''));
      unlink(oldPath).catch(() => undefined);
    }

    return NextResponse.json({ image: publicPath });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Impossible d\'uploader l\'avatar' }, { status: 500 });
  }
}

function detectImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  )
    return 'image/png';
  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  )
    return 'image/webp';
  return null;
}
