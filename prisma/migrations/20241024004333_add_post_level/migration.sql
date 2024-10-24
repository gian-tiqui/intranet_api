/*
  Warnings:

  - Added the required column `lid` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lid" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_lid_fkey" FOREIGN KEY ("lid") REFERENCES "EmployeeLevel"("lid") ON DELETE RESTRICT ON UPDATE CASCADE;
