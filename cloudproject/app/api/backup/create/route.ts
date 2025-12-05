import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const execAsync = promisify(exec);

// Upload file to DigitalOcean Spaces
async function uploadToSpaces(filePath: string, fileName: string): Promise<boolean> {
  try {
    const s3Client = new S3Client({
      region: 'tor1',
      endpoint: 'https://tor1.digitaloceanspaces.com',
      credentials: {
        accessKeyId: 'DO00ABEDTKZQZTQA39AN',
        secretAccessKey: 'JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw',
      },
    });

    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
      Bucket: 'cloudproject',
      Key: `backups/${fileName}`,
      Body: fileContent,
    });

    await s3Client.send(command);
    console.log(`File uploaded to Spaces: backups/${fileName}`);
    return true;
  } catch (error: any) {
    console.error('Error uploading to Spaces:', error.message);
    return false;
  }
}

export async function POST() {
  const uploadDir = '/tmp';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(uploadDir, `backup-${timestamp}.sql`);

  try {
    console.log('Starting backup...');
    
    // Run pg_dump to create backup
    const dumpCommand = `pg_dump -h cloudproject-postgres -U postgres -d cloudproject > ${backupFile}`;
    const env = { ...process.env, PGPASSWORD: '123' };
    
    const { stdout, stderr } = await execAsync(dumpCommand, { env });
    console.log('pg_dump completed');
    
    if (stderr) {
      console.warn('pg_dump warnings:', stderr);
    }

    // Check backup file size
    const stats = fs.statSync(backupFile);
    console.log(`Backup file size: ${stats.size} bytes`);

    // Upload to DigitalOcean Spaces
    console.log('Starting upload to Spaces...');
    const uploadSuccess = await uploadToSpaces(backupFile, `backup-${timestamp}.sql`);

    // Clean up local file
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
      console.log('Local backup file deleted');
    }

    if (!uploadSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backup created but upload to Spaces failed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Backup completed and uploaded successfully',
      fileName: `backup-${timestamp}.sql`,
    });
  } catch (error: any) {
    console.error('Backup failed:', error.message);
    
    // Clean up on error
    if (fs.existsSync(backupFile)) {
      fs.unlinkSync(backupFile);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Backup failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
