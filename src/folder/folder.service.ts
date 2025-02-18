import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getFolders() {
    try {
      return this.prisma.folder.findMany({
        where: { parentId: null },
        include: {
          subfolders: {
            include: {
              posts: true,
            },
          },
          posts: true,
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in fetching the folders: ', error);

      throw error;
    }
  }

  // Create a main folder
  async createMainFolder(name: string) {
    try {
      return this.prisma.folder.create({
        data: {
          name,
          icon: 'mynaui:folder-two',
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in creating a folder: ', error);

      throw error;
    }
  }

  async createSubfolder(name: string, parentId: number) {
    try {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new Error(`Parent folder with ID ${parentId} not found`);
      }

      return this.prisma.folder.create({
        data: {
          name,
          parentId: parentId,
          icon: 'mynaui:folder-two',
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in creating a subfolder: ', error);
    }
  }

  async getPostsByType(folderId: number, typeId?: number) {
    try {
      return this.prisma.post.findMany({
        where: {
          folderId,
          ...(typeId ? { typeId } : {}),
        },
      });
    } catch (error) {
      this.logger.error(
        'There was a problem in fetching posts by type: ',
        error,
      );

      throw error;
    }
  }

  async getFolderById(folderId: number) {
    try {
      return this.prisma.folder.findUnique({
        where: { id: folderId },
        include: {
          subfolders: {
            include: {
              posts: true,
            },
          },
          posts: true,
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in finding a folder:', error);

      throw error;
    }
  }

  async updateFolder(folderId: number, name: string) {
    try {
      return this.prisma.folder.update({
        where: { id: folderId },
        data: { name },
      });
    } catch (error) {
      this.logger.error('There was a problem in updating a folder: ', error);

      throw error;
    }
  }

  async deleteFolder(folderId: number) {
    try {
      const folder = await this.prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        throw new Error(`Folder with ID ${folderId} not found`);
      }

      return this.prisma.folder.delete({
        where: { id: folderId },
      });
    } catch (error) {
      this.logger.error('There was a problem in deleting a folder: ', error);

      throw error;
    }
  }

  async getAllPostsInFolder(folderId: number) {
    try {
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
    } catch (error) {
      this.logger.error(
        'There was a problem in getting all the posts of the folder: ',
        error,
      );

      throw error;
    }
  }
}
