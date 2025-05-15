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
      const { skip = 0, take = 10, search = '', deptId, lid = 0 } = query;
      const lowerSearch = search.toLowerCase();

      const [users, folders, posts] = await Promise.all([
        this.prismaService.user.findMany({
          where: {
            OR: [
              { firstName: { contains: lowerSearch, mode: 'insensitive' } },
              { middleName: { contains: lowerSearch, mode: 'insensitive' } },
              { lastName: { contains: lowerSearch, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
          },
        }),
        this.prismaService.folder.findMany({
          where: {
            name: { contains: lowerSearch, mode: 'insensitive' },
            isPublished: true,
          },
        }),
        this.prismaService.post.findMany({
          where: {
            OR: [
              { title: { contains: lowerSearch, mode: 'insensitive' } },
              { message: { contains: lowerSearch, mode: 'insensitive' } },
            ],
            isPublished: true,
            lid: { gte: lid },
            postDepartments: { some: { deptId } },
          },
        }),
      ]);

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
