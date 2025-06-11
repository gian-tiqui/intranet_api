-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Post"("pid") ON DELETE SET NULL ON UPDATE CASCADE;
