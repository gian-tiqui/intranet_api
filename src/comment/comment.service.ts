import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    const comments = await this.prismaService.comment.findMany();

    return comments;
  }
}
