-- DropForeignKey
ALTER TABLE "EditLogs" DROP CONSTRAINT "EditLogs_updatedBy_fkey";

-- AddForeignKey
ALTER TABLE "EditLogs" ADD CONSTRAINT "EditLogs_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
