-- DropForeignKey
ALTER TABLE "PostDepartment" DROP CONSTRAINT "PostDepartment_postId_fkey";

-- AddForeignKey
ALTER TABLE "PostDepartment" ADD CONSTRAINT "PostDepartment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("pid") ON DELETE CASCADE ON UPDATE CASCADE;
