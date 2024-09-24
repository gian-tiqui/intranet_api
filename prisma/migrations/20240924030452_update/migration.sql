/*
  Warnings:

  - Added the required column `deptId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `deptId` INTEGER NOT NULL;
