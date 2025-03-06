-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_deptId_fkey";

-- DropForeignKey
ALTER TABLE "PostDepartment" DROP CONSTRAINT "PostDepartment_deptId_fkey";

-- AddForeignKey
ALTER TABLE "PostDepartment" ADD CONSTRAINT "PostDepartment_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE CASCADE ON UPDATE CASCADE;
