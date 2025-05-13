-- CreateTable
CREATE TABLE "FolderDepartment" (
    "id" SERIAL NOT NULL,
    "folderId" INTEGER NOT NULL,
    "deptId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FolderDepartment_id_key" ON "FolderDepartment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FolderDepartment_folderId_deptId_key" ON "FolderDepartment"("folderId", "deptId");

-- AddForeignKey
ALTER TABLE "FolderDepartment" ADD CONSTRAINT "FolderDepartment_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderDepartment" ADD CONSTRAINT "FolderDepartment_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("deptId") ON DELETE RESTRICT ON UPDATE CASCADE;
