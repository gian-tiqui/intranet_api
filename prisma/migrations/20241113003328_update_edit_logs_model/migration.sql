/*
  Warnings:

  - You are about to drop the column `log_a` on the `EditLogs` table. All the data in the column will be lost.
  - You are about to drop the column `log_b` on the `EditLogs` table. All the data in the column will be lost.
  - You are about to drop the column `log_c` on the `EditLogs` table. All the data in the column will be lost.
  - You are about to drop the column `log_d` on the `EditLogs` table. All the data in the column will be lost.
  - Added the required column `log` to the `EditLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EditLogs" DROP COLUMN "log_a",
DROP COLUMN "log_b",
DROP COLUMN "log_c",
DROP COLUMN "log_d",
ADD COLUMN     "log" JSONB NOT NULL;
