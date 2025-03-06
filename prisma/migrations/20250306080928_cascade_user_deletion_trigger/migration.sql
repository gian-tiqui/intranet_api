-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_deptId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE CASCADE ON UPDATE CASCADE;
