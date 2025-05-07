-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
