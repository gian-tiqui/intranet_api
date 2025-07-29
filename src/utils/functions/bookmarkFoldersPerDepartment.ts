import { PrismaService } from 'src/prisma/prisma.service';
import errorHandler from './errorHandler';
import { LoggerService } from 'src/logger/logger.service';

const bookmarkFoldersPerDepartment = async (
  prisma: PrismaService,
  folderId: number,
  deptIds: string,
  logger: LoggerService,
) => {
  try {
    if (!deptIds) return;
    const users = await prisma.user.findMany({
      where: {
        deptId: {
          in: deptIds.split(',').map((id) => parseInt(id.trim(), 10)),
        },
      },
      select: {
        id: true,
      },
    });

    const folder = await prisma.folder.findFirst({
      where: { id: folderId },
    });

    if (!folder) {
      throw new Error(`Folder with id ${folderId} not found`);
    }

    if (users.length === 0) {
      logger.warn(`No users found in departments: ${deptIds}`);
      return { success: true, bookmarkedCount: 0 };
    }

    await prisma.folder.update({
      where: { id: folderId },
      data: {
        bookmarkedByUsers: {
          connect: users.map((user) => ({ id: user.id })),
        },
      },
    });

    logger.info(
      `Successfully bookmarked folder ${folderId} for ${users.length} users`,
    );
  } catch (error) {
    errorHandler(error, logger);
  }
};

export default bookmarkFoldersPerDepartment;
