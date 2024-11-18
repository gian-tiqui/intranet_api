/*
  Warnings:

  - You are about to drop the column `imageLocation` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageLocation";

-- CreateTable
CREATE TABLE "ImageLocations" (
    "id" SERIAL NOT NULL,
    "imageLocation" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "ImageLocations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImageLocations" ADD CONSTRAINT "ImageLocations_id_fkey" FOREIGN KEY ("id") REFERENCES "Post"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;
