#!/usr/bin/env bash
set -euo pipefail

# Postgres automated backup to S3-compatible storage (DigitalOcean Spaces)
# Required env vars:
#   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
#   SPACES_KEY, SPACES_SECRET, SPACES_REGION, SPACES_BUCKET, SPACES_ENDPOINT
# Optional:
#   PREFIX - object key prefix inside bucket (e.g. "backups/production/")

: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${SPACES_KEY:?SPACES_KEY is required}"
: "${SPACES_SECRET:?SPACES_SECRET is required}"
: "${SPACES_BUCKET:?SPACES_BUCKET is required}"
: "${SPACES_ENDPOINT:?SPACES_ENDPOINT is required}"

PGPORT=${PGPORT:-5432}
SPACES_REGION=${SPACES_REGION:-us-east-1}
PREFIX=${PREFIX:-}

TS=$(date -u +"%Y%m%dT%H%M%SZ")
FNAME="${PGDATABASE}_backup_${TS}.dump"
TMPDIR=${TMPDIR:-/tmp}
TMPFILE="$TMPDIR/$FNAME"

echo "Starting pg_dump for database '$PGDATABASE' (host=$PGHOST port=$PGPORT user=$PGUSER)"

# export PGPASSWORD for pg_dump
export PGPASSWORD="$PGPASSWORD"

pg_dump -Fc -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$TMPFILE"

echo "Compressing dump..."
gzip -f "$TMPFILE"
GZFILE="$TMPFILE.gz"

echo "Preparing AWS credentials for upload"
export AWS_ACCESS_KEY_ID="$SPACES_KEY"
export AWS_SECRET_ACCESS_KEY="$SPACES_SECRET"
export AWS_DEFAULT_REGION="$SPACES_REGION"

OBJECT_KEY="${PREFIX}${PGDATABASE}_backup_${TS}.dump.gz"

echo "Uploading $GZFILE to s3://$SPACES_BUCKET/$OBJECT_KEY (endpoint: $SPACES_ENDPOINT)"
aws s3 cp "$GZFILE" "s3://$SPACES_BUCKET/$OBJECT_KEY" --endpoint-url "$SPACES_ENDPOINT" --region "$SPACES_REGION"

if [ $? -ne 0 ]; then
  echo "Upload failed" >&2
  exit 2
fi

echo "Upload succeeded: s3://$SPACES_BUCKET/$OBJECT_KEY"

# cleanup local file
rm -f "$GZFILE"

echo "Backup completed successfully"
