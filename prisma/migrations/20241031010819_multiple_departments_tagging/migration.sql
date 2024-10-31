/*
  Warnings:

  - You are about to drop the column `deptId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_deptId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "deptId";

-- CreateTable
CREATE TABLE "PostDepartment" (
    "postId" INTEGER NOT NULL,
    "deptId" INTEGER NOT NULL,

    CONSTRAINT "PostDepartment_pkey" PRIMARY KEY ("postId","deptId")
);

-- AddForeignKey
ALTER TABLE "PostDepartment" ADD CONSTRAINT "PostDepartment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("pid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDepartment" ADD CONSTRAINT "PostDepartment_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE CASCADE ON UPDATE CASCADE;
