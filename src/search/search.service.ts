import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import errorHandler from 'src/utils/functions/errorHandler';
import { FindAllDto } from 'src/utils/global-dto/global.dto';

@Injectable()
export class SearchService {
  private logger: Logger = new Logger(SearchService.name);

  constructor(private readonly prismaService: PrismaService) {}

  globalSearch = async (query: FindAllDto) => {
    try {
      const {
        skip = 0,
        take = 10,
        search = '',
        deptId,
        lid = 0,
        postTypeId,
        folderDeptId,
        searchTypes = ['user', 'folder', 'post'], // Default to all types
      } = query;
      const lowerSearch = search.toLowerCase();

      // Initialize result arrays
      let users: any[] = [];
      let folders: any[] = [];
      let posts: any[] = [];

      // Conditionally run queries based on selected types
      await Promise.all([
        searchTypes.includes('user') &&
          this.prismaService.user
            .findMany({
              where: {
                OR: [
                  { firstName: { contains: lowerSearch, mode: 'insensitive' } },
                  {
                    middleName: { contains: lowerSearch, mode: 'insensitive' },
                  },
                  { lastName: { contains: lowerSearch, mode: 'insensitive' } },
                ],
                ...(deptId ? { deptId } : {}),
              },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                middleName: true,
              },
            })
            .then((res) => (users = res)),

        searchTypes.includes('folder') &&
          this.prismaService.folder
            .findMany({
              where: {
                name: { contains: lowerSearch, mode: 'insensitive' },
                isPublished: true,
                ...(folderDeptId
                  ? {
                      folderDepartments: {
                        some: { deptId: folderDeptId },
                      },
                    }
                  : {}),
              },
            })
            .then((res) => (folders = res)),

        searchTypes.includes('post') &&
          this.prismaService.post
            .findMany({
              where: {
                OR: [
                  { title: { contains: lowerSearch, mode: 'insensitive' } },
                  { message: { contains: lowerSearch, mode: 'insensitive' } },
                ],
                isPublished: true,
                lid: { gte: lid },
                ...(deptId
                  ? {
                      postDepartments: {
                        some: { deptId },
                      },
                    }
                  : {}),
                ...(postTypeId ? { typeId: postTypeId } : {}),
              },
            })
            .then((res) => (posts = res)),
      ]);

      // Score and merge results
      const scoredResults = [
        ...users.map((u) => ({
          type: 'user',
          data: u,
          score:
            (u.firstName?.toLowerCase().includes(lowerSearch) ? 3 : 0) +
            (u.middleName?.toLowerCase().includes(lowerSearch) ? 2 : 0) +
            (u.lastName?.toLowerCase().includes(lowerSearch) ? 1 : 0),
        })),
        ...folders.map((f) => ({
          type: 'folder',
          data: f,
          score: f.name?.toLowerCase().includes(lowerSearch) ? 2 : 0,
        })),
        ...posts.map((p) => ({
          type: 'post',
          data: p,
          score:
            (p.title?.toLowerCase().includes(lowerSearch) ? 3 : 0) +
            (p.message?.toLowerCase().includes(lowerSearch) ? 1 : 0),
        })),
      ];

      const sorted = scoredResults.sort((a, b) => b.score - a.score);
      const total = sorted.length;
      const paginated = sorted.slice(skip, skip + take);

      return {
        total,
        skip,
        take,
        results: paginated,
      };
    } catch (error) {
      errorHandler(error, this.logger);
      throw error;
    }
  };
}
