#!/bin/bash

# Script to run Prisma generate using Docker Compose

# Run the Prisma generate command
docker compose exec server pnpm prisma generate && pnpm prisma generate # Run both to keep docker and local in sync
