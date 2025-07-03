/*
  Warnings:

  - Added the required column `reportedUserId` to the `IncidentReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IncidentReport" DROP CONSTRAINT "IncidentReport_statusId_fkey";

-- AlterTable
ALTER TABLE "IncidentReport" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportedUserId" INTEGER NOT NULL,
ALTER COLUMN "statusId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "IncidentReportStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
