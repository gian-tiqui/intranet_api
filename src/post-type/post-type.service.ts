import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostTypeService {
  constructor(private prismaService: PrismaService) {}

  async getPostTypes() {
    const postTypes = await this.prismaService.postType.findMany();

    return postTypes;
  }
}
