#!/bin/sh
set -e

echo "Running prisma db push..."
npx prisma db push --accept-data-loss

echo "Starting Next.js on port ${PORT:-3000}..."
exec node_modules/.bin/next start -p ${PORT:-3000}
