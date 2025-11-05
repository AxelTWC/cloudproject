import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const DO_SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const DO_SPACES_KEY = process.env.DO_SPACES_KEY;
const DO_SPACES_SECRET = process.env.DO_SPACES_SECRET;
const DO_SPACES_BUCKET = process.env.DO_SPACES_BUCKET;

let s3: S3Client | null = null;
if (DO_SPACES_ENDPOINT && DO_SPACES_KEY && DO_SPACES_SECRET && DO_SPACES_BUCKET) {
  s3 = new S3Client({
    endpoint: DO_SPACES_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: DO_SPACES_KEY,
      secretAccessKey: DO_SPACES_SECRET,
    },
  });
}

export async function saveFile(buffer: Buffer, savedFilename: string) {
  if (s3) {
    const key = savedFilename;
    const contentType = mime.getType(savedFilename) || 'application/octet-stream';
    const cmd = new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    });
  await s3.send(cmd);
  // Construct public url for Spaces standard: https://{bucket}.{endpoint}/{key}
  // We checked above that these env vars exist when s3 was created, so assert non-null here
  const endpoint = DO_SPACES_ENDPOINT!;
  const bucket = DO_SPACES_BUCKET!;
  const cleaned = endpoint.replace(/^https?:\/\//, '');
  // return a path-like url; callers should treat url as a path to download via proxy or direct link
  return `https://${bucket}.${cleaned}/${key}`;
  } else {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
    const filePath = path.join(UPLOAD_DIR, savedFilename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${savedFilename}`;
  }
}

export async function deleteFile(url: string) {
  // If we're configured with an S3-compatible client (DO Spaces), try to delete the object
  if (s3) {
    try {
      // URL looks like: https://{bucket}.{endpoint}/{key}
      const parsed = new URL(url);
      // pathname starts with '/', remove leading slash
      const key = parsed.pathname.replace(/^\/+/, '');
      const cmd = new DeleteObjectCommand({ Bucket: DO_SPACES_BUCKET!, Key: key });
      await s3.send(cmd);
      return true;
    } catch (err) {
      console.error('Failed to delete object from DO Spaces', err);
      throw err;
    }
  }

  // Local uploads using /uploads/<filename>
  try {
    if (url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      // nothing to delete
      return false;
    }
  } catch (err) {
    console.error('Failed to delete local upload', err);
    throw err;
  }

  // Unknown url format
  return false;
}
