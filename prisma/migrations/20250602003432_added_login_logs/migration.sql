-- CreateTable
CREATE TABLE "LoginLogs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoginLogs" ADD CONSTRAINT "LoginLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
