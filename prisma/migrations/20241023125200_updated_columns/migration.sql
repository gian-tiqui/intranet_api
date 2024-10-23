-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "extractedText" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lid" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EmployeeLevel" (
    "lid" SERIAL NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "EmployeeLevel_pkey" PRIMARY KEY ("lid")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lid_fkey" FOREIGN KEY ("lid") REFERENCES "EmployeeLevel"("lid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditLogs" ADD CONSTRAINT "EditLogs_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
