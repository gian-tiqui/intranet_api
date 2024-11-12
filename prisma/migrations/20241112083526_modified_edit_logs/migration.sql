/*
  Warnings:

  - You are about to drop the column `previousData` on the `EditLogs` table. All the data in the column will be lost.
  - Added the required column `editTypeId` to the `EditLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_a` to the `EditLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_b` to the `EditLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_c` to the `EditLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_d` to the `EditLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EditLogs" DROP COLUMN "previousData",
ADD COLUMN     "editTypeId" INTEGER NOT NULL,
ADD COLUMN     "log_a" TEXT NOT NULL,
ADD COLUMN     "log_b" TEXT NOT NULL,
ADD COLUMN     "log_c" TEXT NOT NULL,
ADD COLUMN     "log_d" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EditType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "EditType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EditLogs" ADD CONSTRAINT "EditLogs_editTypeId_fkey" FOREIGN KEY ("editTypeId") REFERENCES "EditType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
