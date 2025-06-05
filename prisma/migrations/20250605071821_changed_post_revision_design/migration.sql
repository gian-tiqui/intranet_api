/*
  Warnings:

  - You are about to drop the `Revision` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Revision" DROP CONSTRAINT "Revision_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "postRevisionId" INTEGER;

-- DropTable
DROP TABLE "Revision";

-- CreateTable
CREATE TABLE "PostRevision" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "PostRevision_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postRevisionId_fkey" FOREIGN KEY ("postRevisionId") REFERENCES "PostRevision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
