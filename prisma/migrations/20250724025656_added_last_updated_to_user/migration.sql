-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastUpdated" DATE;

-- CreateTable
CREATE TABLE "UserUpdates" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "suffix" TEXT,
    "gender" TEXT,
    "localNumber" TEXT,
    "address" TEXT,
    "jobTitle" TEXT,
    "officeLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUpdates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserUpdates" ADD CONSTRAINT "UserUpdates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
