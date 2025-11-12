import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    const s3Client = new S3Client({
      endpoint: process.env.SPACES_ENDPOINT,
      region: process.env.SPACES_REGION,
      credentials: {
        accessKeyId: process.env.SPACES_KEY!,
        secretAccessKey: process.env.SPACES_SECRET!,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: process.env.SPACES_BUCKET,
      Prefix: 'backups/',
    });

    const response = await s3Client.send(command);

    const backups = (response.Contents || [])
      .filter((item) => item.Key && item.Key.endsWith('.dump.gz'))
      .map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
      }))
      .sort((a, b) => {
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
        return dateB - dateA; // newest first
      });

    return NextResponse.json({
      success: true,
      backups,
    });
  } catch (error: any) {
    console.error('Failed to list backups:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list backups',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
