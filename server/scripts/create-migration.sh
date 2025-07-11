#!/bin/bash

# Usage: ./create-migration.sh migration_name

# Show usage if migration name is not provided
if [ -z "$1" ]; then
  echo "Error: Migration name is required"
  echo "Usage: ./create-migration.sh migration_name"
  exit 1
fi

# Migration name variable
MIGRATION_NAME=$1

# Create migration using Prisma CLI in the server container
docker compose exec server pnpm prisma migrate dev --name "$MIGRATION_NAME"