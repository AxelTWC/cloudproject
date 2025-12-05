import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    const s3Client = new S3Client({
      region: 'tor1',
      endpoint: 'https://tor1.digitaloceanspaces.com',
      credentials: {
        accessKeyId: 'DO00ABEDTKZQZTQA39AN',
        secretAccessKey: 'JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw',
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: 'cloudproject',
      Prefix: 'backups/',
    });

    const response = await s3Client.send(command);

    const backups = (response.Contents || [])
      .filter((item) => item.Key && item.Key.endsWith('.sql'))
      .map((item) => ({
        key: item.Key,
        name: item.Key?.split('/').pop() || 'Unknown',
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
    console.error('Failed to list backups:', error.message);
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
