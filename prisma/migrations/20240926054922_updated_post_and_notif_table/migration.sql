-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_postId_fkey`;

-- AlterTable
ALTER TABLE `notification` MODIFY `postId` INTEGER NULL;
