#!/usr/bin/env bash
set -euo pipefail

# Restore a backup previously uploaded to an S3-compatible bucket (DigitalOcean Spaces)
# Usage:
#   ./pg_restore.sh <s3-object-key>         # downloads from bucket then restores
#   ./pg_restore.sh /path/to/local/file.gz  # restore from local file
#
# Required env vars:
#   PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
#   SPACES_KEY, SPACES_SECRET, SPACES_REGION, SPACES_BUCKET, SPACES_ENDPOINT (if downloading from s3)

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <s3://... or s3-object-key or /path/to/local/file.gz>"
  exit 1
fi

TARGET="$1"
TMPDIR=${TMPDIR:-/tmp}

# basic checks
: "${PGHOST:?PGHOST is required}"
: "${PGUSER:?PGUSER is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
: "${PGDATABASE:?PGDATABASE is required}"

export PGPASSWORD="$PGPASSWORD"

local_file=""

if [[ "$TARGET" == s3://* ]] || [[ "$TARGET" != /* && "$TARGET" != .* && "$TARGET" == *.*gz ]]; then
  # if starts with s3:// or looks like an s3 object key (no leading slash but with extension), attempt to download
  if [[ "$TARGET" == s3://* ]]; then
    s3uri="$TARGET"
  else
    # treat as object key inside bucket
    : "${SPACES_KEY:?SPACES_KEY required to download from s3}"
    : "${SPACES_SECRET:?SPACES_SECRET required to download from s3}"
    : "${SPACES_BUCKET:?SPACES_BUCKET required to download from s3}"
    : "${SPACES_ENDPOINT:?SPACES_ENDPOINT required to download from s3}"
    : "${SPACES_REGION:?SPACES_REGION required to download from s3}"
    s3uri="s3://$SPACES_BUCKET/$TARGET"
  fi

  echo "Downloading $s3uri"
  export AWS_ACCESS_KEY_ID="$SPACES_KEY"
  export AWS_SECRET_ACCESS_KEY="$SPACES_SECRET"
  export AWS_DEFAULT_REGION="${SPACES_REGION:-us-east-1}"

  local_file="$TMPDIR/$(basename "$s3uri")"
  aws s3 cp "$s3uri" "$local_file" --endpoint-url "$SPACES_ENDPOINT" --region "$AWS_DEFAULT_REGION"
else
  # treat as local path
  if [ ! -f "$TARGET" ]; then
    echo "Local file not found: $TARGET" >&2
    exit 2
  fi
  local_file="$TARGET"
fi

echo "Restoring from $local_file"

# if file is gzipped, gunzip to a temp file
if [[ "$local_file" == *.gz ]]; then
  UNGZ="$TMPDIR/restore_$(date +%s).dump"
  gunzip -c "$local_file" > "$UNGZ"
  RESTORE_FILE="$UNGZ"
else
  RESTORE_FILE="$local_file"
fi

# use pg_restore for custom-format dump
pg_restore --verbose --clean --no-owner -h "$PGHOST" -p "${PGPORT:-5432}" -U "$PGUSER" -d "$PGDATABASE" "$RESTORE_FILE"

echo "Restore finished"
