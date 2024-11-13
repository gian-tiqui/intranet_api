-- DropForeignKey
ALTER TABLE "EditLogs" DROP CONSTRAINT "EditLogs_id_fkey";

-- AddForeignKey
ALTER TABLE "EditLogs" ADD CONSTRAINT "EditLogs_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
