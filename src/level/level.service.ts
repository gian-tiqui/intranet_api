import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LevelService {
  constructor(private prismaService: PrismaService) {}

  async findAll(lid?: number) {
    const levels = await this.prismaService.employeeLevel.findMany({
      include: { posts: true, users: true },
      where: {
        ...(lid && { lid: Number(lid) }),
      },
    });

    return levels;
  }
}
