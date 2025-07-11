#!/bin/bash

# Script to run Prisma studio

# Run the Prisma studio command
docker compose exec server pnpm prisma studio
