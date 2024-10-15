-- AlterTable
ALTER TABLE `notification` ADD COLUMN `deptId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_deptId_fkey` FOREIGN KEY (`deptId`) REFERENCES `Department`(`deptId`) ON DELETE SET NULL ON UPDATE CASCADE;
