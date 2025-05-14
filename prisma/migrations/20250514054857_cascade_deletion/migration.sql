-- DropForeignKey
ALTER TABLE "FolderDepartment" DROP CONSTRAINT "FolderDepartment_folderId_fkey";

-- AddForeignKey
ALTER TABLE "FolderDepartment" ADD CONSTRAINT "FolderDepartment_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
