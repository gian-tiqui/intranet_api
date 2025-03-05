/*
  Warnings:

  - You are about to drop the column `readable` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "readable",
ADD COLUMN     "downloadable" BOOLEAN NOT NULL DEFAULT false;
