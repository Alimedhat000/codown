/*
  Warnings:

  - Made the column `shareId` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "shareId" SET NOT NULL;
