# PostgreSQL Backup and Recovery

Simple backup and restore system for your PostgreSQL database with DigitalOcean Spaces storage.

## Features

✅ **Web UI** - Easy-to-use interface at `/dashboard/backup`  
✅ **One-Click Backup** - Create backups with a button click  
✅ **One-Click Restore** - Restore from any previous backup  
✅ **Cloud Storage** - All backups stored in DigitalOcean Spaces  
✅ **List View** - See all backups with dates and sizes  

## Quick Start

### 1. Make sure Docker is running

```powershell
docker-compose up
```

### 2. Open the backup UI

Navigate to: **http://localhost:3000/dashboard/backup**

### 3. Create a backup

Click the **"💾 Create Backup Now"** button

### 4. Restore if needed

Click **"↺ Restore"** on any backup in the list

## How It Works

```
┌──────────────────────────────────────────────────────────┐
│  1. You click "Create Backup"                             │
│  2. App runs pg_dump on PostgreSQL database              │
│  3. Dump is compressed (gzip)                            │
│  4. File is uploaded to DigitalOcean Spaces              │
│  5. Backup appears in the list                           │
└──────────────────────────────────────────────────────────┘
```

## Backup Storage

- **Location:** DigitalOcean Spaces bucket `cloudproject`
- **Region:** Toronto (tor1)
- **Path:** `backups/cloudproject_backup_YYYYMMDDTHHMMSSZ.dump.gz`
- **Format:** PostgreSQL custom format (compressed)

## Configuration

All settings are in your `.env` file:

```env
# Database
DB_USER=postgres
DB_PASSWORD=123
DB_NAME=cloudproject

# DigitalOcean Spaces
SPACES_KEY=DO00ABEDTKZQZTQA39AN
SPACES_SECRET=JFySfaRlPqZHJu4C+fgx0uS5MSjMlhpv3qKobOJVriw
SPACES_BUCKET=cloudproject
SPACES_ENDPOINT=https://cloudproject.tor1.digitaloceanspaces.com
SPACES_REGION=tor1
```

## API Endpoints

If you want to integrate backups into your own code:

### Create Backup
```typescript
POST /api/backup/create
Response: { success: boolean, message: string }
```

### List Backups
```typescript
GET /api/backup/list
Response: { success: boolean, backups: Array<{key, size, lastModified}> }
```

### Restore Backup
```typescript
POST /api/backup/restore
Body: { backupFile: string }
Response: { success: boolean, message: string }
```

## Files

### Web UI
- `app/dashboard/backup/page.tsx` - Backup & restore interface
- `app/api/backup/create/route.ts` - Create backup API
- `app/api/backup/restore/route.ts` - Restore backup API
- `app/api/backup/list/route.ts` - List backups API

### Scripts (used by Docker container)
- `scripts/pg_backup.sh` - Backup script
- `scripts/pg_restore.sh` - Restore script
- `deploy/backup/Dockerfile` - Backup container image

## Manual Backup (Command Line)

If you prefer command line:

```powershell
docker run --rm --network cloudproject_default `
  -e PGHOST=db -e PGPORT=5432 `
  -e PGUSER=postgres -e PGPASSWORD=123 -e PGDATABASE=cloudproject `
  -e SPACES_KEY=$env:SPACES_KEY `
  -e SPACES_SECRET=$env:SPACES_SECRET `
  -e SPACES_BUCKET=$env:SPACES_BUCKET `
  -e SPACES_ENDPOINT=$env:SPACES_ENDPOINT `
  -e SPACES_REGION=$env:SPACES_REGION `
  -e PREFIX=backups/ `
  local/pg-backup:latest
```

## Troubleshooting

### Backup fails with "connection refused"
- Make sure Docker containers are running: `docker ps`
- Check database container name: `docker ps | grep postgres`

### "Docker image not found"
- Build the image: `docker build -t local/pg-backup:latest -f deploy/backup/Dockerfile .`

### Backup succeeds but file not in Spaces
- Check your Spaces credentials in `.env`
- Verify bucket name and region
- Check Spaces dashboard: https://cloud.digitalocean.com/spaces

### Restore fails
- Ensure the backup file exists in Spaces
- Check the backup file name is correct
- Make sure no apps are actively using the database

## Security Notes

- ✅ `.env` file is in `.gitignore` (credentials not committed)
- ✅ API endpoints should be protected with authentication in production
- ✅ Backup files contain all database data - secure your Spaces bucket
- ✅ Consider enabling Spaces encryption at rest

## Cost

DigitalOcean Spaces pricing:
- **$5/month** for 250 GB storage + 1 TB transfer
- Average backup size: ~1-5 MB (depends on your data)
- 30 days of daily backups: ~30-150 MB total
- **Estimated cost: $5/month** (base tier)

## Backup Best Practices

1. **Create backups regularly** - Before major changes
2. **Test restores** - Verify backups work
3. **Monitor Spaces usage** - Keep an eye on storage costs
4. **Delete old backups** - Remove outdated backups manually from Spaces
5. **Download important backups** - Keep local copies of critical backups

## Next Steps

- Add authentication to backup routes (protect with middleware)
- Set up automatic daily backups (cron job or scheduled task)
- Add backup retention policy (auto-delete old backups)
- Add email notifications on backup success/failure
- Implement backup encryption before upload
