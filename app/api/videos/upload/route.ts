import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

const ALLOWED_VIDEO_TYPES = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DURATION = 5 * 60; // 5 minutes
const MIN_DURATION = 10; // 10 seconds

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const exerciseId = formData.get('exerciseId') as string;

    if (!file || !exerciseId) {
      return Response.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return Response.json(
        {
          message: `Unsupported video format. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      return Response.json(
        {
          message: `File size ${sizeMB}MB exceeds maximum of 100MB`,
        },
        { status: 400 }
      );
    }

    // Validate file size minimum (at least 1KB)
    if (file.size < 1024) {
      return Response.json(
        { message: 'File is too small' },
        { status: 400 }
      );
    }

    // Check if exercise exists and belongs to user
    const exercise = await prisma.exercise.findFirst({
      where: {
        id: exerciseId,
        userId: session.user.id,
      },
    });

    if (!exercise) {
      return Response.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Check for duplicate submissions
    const existingVideo = await prisma.video.findFirst({
      where: {
        exerciseId,
        userId: session.user.id,
        status: { in: ['APPROVED', 'REVISION_NEEDED'] },
      },
    });

    if (existingVideo) {
      return Response.json(
        {
          message: 'You already have a submission for this exercise',
        },
        { status: 409 }
      );
    }

    // Upload to Vercel Blob with unique naming
    const timestamp = Date.now();
    const blobPath = `videos/${session.user.id}/${exerciseId}-${timestamp}.${file.type.split('/')[1] || 'webm'}`;

    let blob;
    try {
      blob = await put(blobPath, file, {
        access: 'private',
        contentType: file.type,
      });
    } catch (uploadError) {
      console.error('Blob upload error:', uploadError);
      return Response.json(
        { message: 'Failed to upload video to storage' },
        { status: 500 }
      );
    }

    // Create video record in database with pending status
    const video = await prisma.video.create({
      data: {
        userId: session.user.id,
        exerciseId,
        blobUrl: blob.url,
        duration: 0, // Will be extracted by admin during review
        status: 'PENDING',
      },
    });

    console.log(`[Video Upload] User ${session.user.id} uploaded video ${video.id} for exercise ${exerciseId}`);

    return Response.json(
      {
        message: 'Video uploaded successfully',
        videoId: video.id,
        url: blob.url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Video upload error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
