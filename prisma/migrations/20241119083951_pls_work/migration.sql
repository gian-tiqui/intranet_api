-- DropForeignKey
ALTER TABLE "ImageLocations" DROP CONSTRAINT "ImageLocations_postId_fkey";

-- AddForeignKey
ALTER TABLE "ImageLocations" ADD CONSTRAINT "ImageLocations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("pid") ON DELETE CASCADE ON UPDATE CASCADE;
