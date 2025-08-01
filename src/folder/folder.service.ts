import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { Prisma } from '@prisma/client';
import { CreateFolderDto } from './create-folder.dto';
import { UpdateFolderDto } from './update-folder.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import bookmarkFoldersPerDepartment from 'src/utils/functions/bookmarkFoldersPerDepartment';

@Injectable()
export class FolderService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getFolders(query: FindAllDto) {
    try {
      const {
        search,
        skip,
        take,
        includeSubfolders,
        depth,
        isPublished,
        deptId,
      } = query;

      const where: Prisma.FolderWhereInput = {
        ...(includeSubfolders === 0 && { parentId: null }),
        ...(search && {
          OR: [{ name: { contains: search, mode: 'insensitive' } }],
        }),
        isPublished: isPublished === 1 ? true : false,
        ...(deptId && { folderDepartments: { some: { deptId } } }),
      };

      const buildInclude = (depth: number): Prisma.FolderInclude => {
        if (depth <= 0 || !depth) return {};
        return {
          subfolders: {
            include: buildInclude(depth - 1),
          },
        };
      };

      const folders = await this.prisma.folder.findMany({
        where,
        include: buildInclude(depth || 1),
        skip,
        take,
        orderBy: { name: 'asc' },
      });

      const count = await this.prisma.folder.count({
        where,
      });

      return {
        message: 'Folders loaded successfully.',
        folders,
        count,
      };
    } catch (error) {
      this.logger.error('There was a problem in fetching the folders: ', error);
      throw error;
    }
  }

  async getFoldersSubfolder(folderId: number, query: FindAllDto) {
    try {
      const { search, skip, take, isPublished, deptId } = query;

      const where: Prisma.FolderWhereInput = {
        ...(search && {
          OR: [{ name: { contains: search, mode: 'insensitive' } }],
        }),
        parentId: folderId,
        isPublished: isPublished === 1 ? true : false,
        ...(deptId && { folderDepartments: { some: { deptId } } }),
      };

      const folders = await this.prisma.folder.findMany({
        where,
        skip,
        take,
      });

      const count = await this.prisma.folder.count({
        where,
      });

      return {
        message: 'Folders loaded successfully.',
        folders,
        count,
      };
    } catch (error) {
      this.logger.error('There was a problem in fetching the folders: ', error);

      throw error;
    }
  }

  // Create a main folder
  async createMainFolder(createFolderDto: CreateFolderDto) {
    const { deptIds, bookmarkDeptIds, ...dto } = createFolderDto;
    try {
      const newfolder = await this.prisma.folder.create({
        data: {
          ...dto,
          icon: 'mynaui:folder-two',
          isPublished: createFolderDto.isPublished === 1 ? true : false,
          folderDepartments: {
            createMany: {
              data: [
                ...deptIds
                  .split(',')
                  .map((deptId) => ({ deptId: parseInt(deptId) })),
              ],
            },
          },
        },
      });

      if (bookmarkDeptIds) {
        bookmarkFoldersPerDepartment(
          this.prisma,
          newfolder.id,
          bookmarkDeptIds,
          this.logger,
        );
      }

      return newfolder;
    } catch (error) {
      this.logger.error('There was a problem in creating a folder: ', error);

      throw error;
    }
  }

  async createSubfolder(createSubFolderDto: CreateFolderDto, parentId: number) {
    try {
      const parentFolder = await this.prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new Error(`Parent folder with ID ${parentId} not found`);
      }

      const { deptIds, bookmarkDeptIds, createDefaultFolders, ...dto } =
        createSubFolderDto;

      const postTypes = await this.prisma.postType.findMany();

      const newSubfolder = await this.prisma.folder.create({
        data: {
          ...dto,
          parentId: parentId,
          icon: 'mynaui:folder-two',
          isPublished: createSubFolderDto.isPublished === 1 ? true : false,
          folderDepartments: {
            createMany: {
              data: [
                ...deptIds
                  .split(',')
                  .map((deptId) => ({ deptId: parseInt(deptId) })),
              ],
            },
          },
        },
      });

      if (bookmarkDeptIds) {
        bookmarkFoldersPerDepartment(
          this.prisma,
          newSubfolder.id,
          bookmarkDeptIds,
          this.logger,
        );
      }

      if (createDefaultFolders === 1) {
        postTypes.map(async (postType) => {
          await this.prisma.folder.create({
            data: {
              name: postType.name[0].toUpperCase() + postType.name.slice(1),
              userId: dto.userId,
              parentId: newSubfolder.id,
              isPublished: true,
              folderDepartments: {
                createMany: {
                  data: [
                    ...deptIds
                      .split(',')
                      .map((deptId) => ({ deptId: parseInt(deptId) })),
                  ],
                },
              },
            },
          });
        });
      }

      return newSubfolder;
    } catch (error) {
      this.logger.error('There was a problem in creating a subfolder: ', error);

      throw error;
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

  async getFolderById(folderId: number, deptId: number) {
    try {
      return this.prisma.folder.findUnique({
        where: { id: folderId },
        include: {
          subfolders: {
            where: {
              ...(deptId && { folderDepartments: { some: { deptId } } }),
            },
            include: {
              posts: {
                where: { isPublished: true },
              },
            },
          },
          posts: { where: { isPublished: true } },
          folderDepartments: true,
        },
      });
    } catch (error) {
      this.logger.error('There was a problem in finding a folder:', error);

      throw error;
    }
  }

  async getFolderPosts(folderId: number, query: FindAllDto) {
    try {
      const { search, skip, take } = query;

      const where: Prisma.PostWhereInput = {
        folderId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { extractedText: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ],
        }),
        isPublished: true,
      };

      const folder = await this.prisma.folder.findFirst({
        where: { id: folderId },
      });

      if (!folder)
        throw new NotFoundException(`Folder with the id ${folderId} not found`);

      const post = await this.prisma.post.findMany({
        where,
        orderBy: { title: 'asc' },
        include: { imageLocations: true },
        skip,
        take,
      });

      const count = await this.prisma.post.findMany({
        where,
      });

      return {
        message: `Posts of the folder with the id ${folderId} loaded successfully.`,
        post,
        count,
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  async updateFolder(folderId: number, updateFolderDto: UpdateFolderDto) {
    const { isPublished, ...rest } = updateFolderDto;
    try {
      return this.prisma.folder.update({
        where: { id: folderId },
        data: { ...rest, isPublished: isPublished === 1 ? true : false },
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

      await this.prisma.folder.delete({
        where: { id: folderId },
      });

      return {
        message: 'Folder deleted successfully.',
      };
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

  getFolderSubfolders = async (folderId: number, query: FindAllDto) => {
    try {
      const { search, skip, take, isPublished, deptId } = query;

      const where: Prisma.FolderWhereInput = {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        parentId: folderId,
        isPublished: isPublished === 1 ? true : false,
        folderDepartments: { some: { deptId } },
      };

      const parentFolder = await this.prisma.folder.findFirst({
        where: { id: folderId },
      });

      if (!parentFolder)
        throw new NotFoundException(
          `Parent folder with the id ${folderId} not found.`,
        );

      const subfolders = await this.prisma.folder.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      });

      const count = await this.prisma.folder.count({ where });

      const retval = {
        message: `Subfolders of folder with the id ${folderId} loaded successfully.`,
        subfolders,
        count,
      };

      return retval;
    } catch (error) {
      errorHandler(error, this.logger);
    }
  };
}
