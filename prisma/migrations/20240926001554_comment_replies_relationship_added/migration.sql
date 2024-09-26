-- AlterTable
ALTER TABLE `comment` ADD COLUMN `parentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Comment_parentId_idx` ON `Comment`(`parentId`);

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Comment`(`cid`) ON DELETE SET NULL ON UPDATE CASCADE;
