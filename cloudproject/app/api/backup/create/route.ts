import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const command = `docker run --rm --network cloudproject_default \
      -e PGHOST=db \
      -e PGPORT=5432 \
      -e PGUSER=postgres \
      -e PGPASSWORD=123 \
      -e PGDATABASE=cloudproject \
      -e SPACES_KEY=DO00ABEDTKZQZTQA39AN \
      -e SPACES_SECRET=JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw \
      -e SPACES_BUCKET=cloudproject \
      -e SPACES_ENDPOINT=https://cloudproject.tor1.digitaloceanspaces.com \
      -e SPACES_REGION=tor1 \
      -e PREFIX=backups/ \
      local/pg-backup:latest`;

    const { stdout, stderr } = await execAsync(command);

    return NextResponse.json({
      success: true,
      message: 'Backup completed successfully',
      output: stdout,
      error: stderr || null,
    });
  } catch (error: any) {
    console.error('Backup failed:', error);
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
