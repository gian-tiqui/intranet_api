/*
  Warnings:

  - You are about to drop the column `lid` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_lid_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lid";
