FROM alpine:3.18

RUN apk add --no-cache postgresql-client gzip python3 py3-pip curl bash
RUN pip install --no-cache-dir awscli

WORKDIR /app
COPY scripts/pg_backup.sh /app/pg_backup.sh
COPY scripts/pg_restore.sh /app/pg_restore.sh
RUN chmod +x /app/pg_backup.sh /app/pg_restore.sh

ENV PATH="/root/.local/bin:$PATH"

CMD ["/app/pg_backup.sh"]
