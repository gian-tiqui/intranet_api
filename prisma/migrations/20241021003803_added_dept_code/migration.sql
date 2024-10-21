/*
  Warnings:

  - Added the required column `departmentCode` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `department` ADD COLUMN `departmentCode` VARCHAR(191) NOT NULL;
