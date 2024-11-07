/*
  Warnings:

  - You are about to drop the column `departmentId` on the `PostDepartment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId,deptId]` on the table `PostDepartment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deptId` to the `PostDepartment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PostDepartment" DROP CONSTRAINT "PostDepartment_departmentId_fkey";

-- DropIndex
DROP INDEX "PostDepartment_postId_departmentId_key";

-- AlterTable
ALTER TABLE "PostDepartment" DROP COLUMN "departmentId",
ADD COLUMN     "deptId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PostDepartment_postId_deptId_key" ON "PostDepartment"("postId", "deptId");

-- AddForeignKey
ALTER TABLE "PostDepartment" ADD CONSTRAINT "PostDepartment_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;
