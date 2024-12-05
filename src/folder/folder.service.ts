import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  async getFolders() {
    return this.prisma.folder.findMany({
      where: { parentId: null },
      include: {
        subfolders: {
          include: {
            posts: {
              include: { postType: true },
            },
          },
        },
        posts: {
          include: { postType: true },
        },
      },
    });
  }

  // Create a main folder
  async createMainFolder(name: string) {
    return this.prisma.folder.create({
      data: {
        name,
      },
    });
  }

  async createSubfolder(name: string, parentId: number) {
    const parentFolder = await this.prisma.folder.findUnique({
      where: { id: Number(parentId) },
    });

    if (!parentFolder) {
      throw new Error(`Parent folder with ID ${parentId} not found`);
    }

    return this.prisma.folder.create({
      data: {
        name,
        parentId: Number(parentId),
      },
    });
  }

  async getPostsByType(folderId: number, typeId?: number) {
    return this.prisma.post.findMany({
      where: {
        folderId,
        ...(typeId ? { typeId } : {}),
      },
      include: {
        postType: true,
      },
    });
  }

  async getFolderById(folderId: number) {
    return this.prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        subfolders: {
          include: {
            posts: {
              include: { postType: true },
            },
          },
        },
        posts: {
          include: { postType: true },
        },
      },
    });
  }

  async updateFolder(folderId: number, name: string) {
    return this.prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });
  }

  async deleteFolder(folderId: number) {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }

    return this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  async getAllPostsInFolder(folderId: number) {
    const folderWithSubfolders = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        subfolders: {
          include: { posts: true },
        },
        posts: true,
      },
    });

    if (!folderWithSubfolders) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }

    const allPosts = [
      ...folderWithSubfolders.posts,
      ...folderWithSubfolders.subfolders.flatMap((sub) => sub.posts),
    ];

    return allPosts;
  }
}
