/*
  Warnings:

  - You are about to drop the column `postRevisionId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PostRevision` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_postRevisionId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "postRevisionId";

-- AlterTable
ALTER TABLE "PostReader" ADD COLUMN     "understood" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "confirmed" SET DEFAULT true;

-- DropTable
DROP TABLE "PostRevision";
