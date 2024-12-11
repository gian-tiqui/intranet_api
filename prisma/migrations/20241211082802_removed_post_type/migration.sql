/*
  Warnings:

  - You are about to drop the column `typeId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `PostType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_typeId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "typeId";

-- DropTable
DROP TABLE "PostType";
