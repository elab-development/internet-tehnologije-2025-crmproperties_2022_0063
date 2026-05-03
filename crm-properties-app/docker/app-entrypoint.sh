#!/bin/sh
set -e

cd /app

echo "Starting CRM Properties application..."

echo "Waiting for PostgreSQL database..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
do
  sleep 1
done

echo "Database is ready."

echo "Generating Prisma client..."
npx prisma generate

echo "Resetting database, applying migrations and running seed..."
npx prisma migrate reset --force

echo "Starting Next.js application..."
exec npm run dev -- --hostname 0.0.0.0 --port 3000