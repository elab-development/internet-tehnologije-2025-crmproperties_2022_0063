#!/bin/sh
set -e

cd /app

echo "Starting Prisma Studio..."

echo "Waiting for PostgreSQL database..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
do
  sleep 1
done

echo "Database is ready."

echo "Generating Prisma client..."
npx prisma generate

echo "Opening Prisma Studio on port 5555..."
exec npx prisma studio --hostname 0.0.0.0 --port 5555