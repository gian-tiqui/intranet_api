/*
  Warnings:

  - You are about to drop the `PostDepartment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deptId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PostDepartment" DROP CONSTRAINT "PostDepartment_deptId_fkey";

-- DropForeignKey
ALTER TABLE "PostDepartment" DROP CONSTRAINT "PostDepartment_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "deptId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "PostDepartment";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;
