import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    const command = `docker run --rm --network cloudproject_default \
      -e PGHOST=db \
      -e PGPORT=5432 \
      -e PGUSER=${process.env.DB_USER} \
      -e PGPASSWORD=${process.env.DB_PASSWORD} \
      -e PGDATABASE=${process.env.DB_NAME} \
      -e SPACES_KEY=${process.env.SPACES_KEY} \
      -e SPACES_SECRET=${process.env.SPACES_SECRET} \
      -e SPACES_BUCKET=${process.env.SPACES_BUCKET} \
      -e SPACES_ENDPOINT=${process.env.SPACES_ENDPOINT} \
      -e SPACES_REGION=${process.env.SPACES_REGION} \
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
