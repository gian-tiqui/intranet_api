/*
  Warnings:

  - You are about to alter the column `zipCode` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `message` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `zipCode` INTEGER NULL;
