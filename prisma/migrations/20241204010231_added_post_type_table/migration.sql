-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "typeId" INTEGER;

-- CreateTable
CREATE TABLE "PostType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PostType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PostType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
