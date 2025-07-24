/*
  Warnings:

  - Made the column `lastUpdated` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastUpdated" SET NOT NULL,
ALTER COLUMN "lastUpdated" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "lastUpdated" SET DATA TYPE TIMESTAMP(3);
