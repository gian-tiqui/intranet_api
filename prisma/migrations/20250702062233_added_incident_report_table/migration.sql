-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "incidentReportId" INTEGER;

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "reportDescription" TEXT NOT NULL,
    "reportedDepartmentExplanation" TEXT NOT NULL,
    "sanction" TEXT NOT NULL,
    "reportingDepartmentId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reportedDepartmentId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReportStatus" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReportStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReportImageLocations" (
    "id" SERIAL NOT NULL,
    "imageLocation" TEXT NOT NULL,
    "incidentReportId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReportImageLocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReportStatus_status_key" ON "IncidentReportStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReportImageLocations_imageLocation_key" ON "IncidentReportImageLocations"("imageLocation");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_incidentReportId_fkey" FOREIGN KEY ("incidentReportId") REFERENCES "IncidentReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reportingDepartmentId_fkey" FOREIGN KEY ("reportingDepartmentId") REFERENCES "Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_reportedDepartmentId_fkey" FOREIGN KEY ("reportedDepartmentId") REFERENCES "Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "IncidentReportStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReportImageLocations" ADD CONSTRAINT "IncidentReportImageLocations_incidentReportId_fkey" FOREIGN KEY ("incidentReportId") REFERENCES "IncidentReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
