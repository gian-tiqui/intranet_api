-- DropIndex
DROP INDEX `Notification_postId_fkey` ON `notification`;

-- CreateTable
CREATE TABLE `React` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `cid` INTEGER NULL,
    `pid` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
