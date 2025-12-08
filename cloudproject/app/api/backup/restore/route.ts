import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);

async function downloadFromSpaces(backupKey: string, localPath: string): Promise<boolean> {
  try {
    const s3Client = new S3Client({
      region: 'tor1',
      endpoint: 'https://tor1.digitaloceanspaces.com',
      credentials: {
        accessKeyId: 'DO00ABEDTKZQZTQA39AN',
        secretAccessKey: 'JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw',
      },
    });

    const command = new GetObjectCommand({
      Bucket: 'cloudproject',
      Key: backupKey,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as any;

    return new Promise((resolve) => {
      const writeStream = fs.createWriteStream(localPath);
      stream.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log(`Downloaded backup from Spaces: ${backupKey}`);
        resolve(true);
      });

      writeStream.on('error', (error) => {
        console.error('Error downloading backup:', error);
        resolve(false);
      });
    });
  } catch (error: any) {
    console.error('Error downloading from Spaces:', error.message);
    return false;
  }
}

async function performRestore(backupFile: string) {
  const downloadDir = '/tmp';
  const backupFileName = `restore-${Date.now()}.sql`;
  const backupFilePath = path.join(downloadDir, backupFileName);

  try {
    console.log(`Starting restore for: ${backupFile}`);

    console.log('Downloading backup file from Spaces...');
    const downloadSuccess = await downloadFromSpaces(backupFile, backupFilePath);

    if (!downloadSuccess) {
      console.error('Failed to download backup file from Spaces');
      return;
    }

    console.log('Starting restore process...');
    
    const restoreCommand = `psql -h cloudproject-postgres -U postgres -d cloudproject < ${backupFilePath}`;
    const env = { ...process.env, PGPASSWORD: '123' };

    const { stdout, stderr } = await execAsync(restoreCommand, { env });
    console.log('Restore completed');

    if (stderr) {
      console.warn('Restore warnings:', stderr);
    }

    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
      console.log('Local backup file deleted');
    }

    console.log('Restore completed successfully');
  } catch (error: any) {
    console.error('Restore failed:', error.message);

    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { backupFile } = await request.json();

    if (!backupFile) {
      return NextResponse.json(
        { success: false, message: 'Backup file is required' },
        { status: 400 }
      );
    }

   
    performRestore(backupFile).catch(err => {
      console.error('Background restore error:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Restore started in background',
    });
  } catch (error: any) {
    console.error('Restore request failed:', error.message);

    return NextResponse.json(
      {
        success: false,
        message: 'Restore request failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}