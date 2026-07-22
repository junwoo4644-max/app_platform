#!/bin/sh
set -e

mkdir -p /app/data

# Small single-tenant app, no team to coordinate migrations with -- db push
# keeps the sqlite schema in sync without a migration history to manage.
npx prisma db push --skip-generate --accept-data-loss

# Creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD if it doesn't exist yet.
node scripts/seed.js

exec npx next start
