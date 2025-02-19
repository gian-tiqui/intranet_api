import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RateLimit } from 'nestjs-rate-limiter';

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @RateLimit({
    keyPrefix: 'find_main_folders',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before fetching all unread notifications.',
  })
  @Get()
  async getFolders() {
    return this.folderService.getFolders();
  }

  @Post()
  @RateLimit({
    keyPrefix: 'create_main_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before creating a new folder.',
  })
  async createMainFolder(@Body('name') name: string) {
    return this.folderService.createMainFolder(name);
  }

  @Post(':parentId/subfolder')
  @RateLimit({
    keyPrefix: 'create_sub_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before creating a new sub folder.',
  })
  async createSubfolder(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.createSubfolder(name, parentId);
  }

  @Get(':folderId/posts')
  @RateLimit({
    keyPrefix: 'get_folder_files',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before loading folder files.',
  })
  async getPostsByType(
    @Param('folderId', ParseIntPipe) folderId: number,
    @Query('typeId', ParseIntPipe) typeId?: number,
  ) {
    return this.folderService.getPostsByType(
      folderId,
      typeId ? typeId : undefined,
    );
  }

  @Get(':folderId')
  @RateLimit({
    keyPrefix: 'get_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before getting a folder.',
  })
  async getFolderById(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.getFolderById(folderId);
  }

  @Put(':folderId')
  @RateLimit({
    keyPrefix: 'update_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before updating a folder.',
  })
  async updateFolder(
    @Param('folderId', ParseIntPipe) folderId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.updateFolder(folderId, name);
  }

  @Delete(':folderId')
  @RateLimit({
    keyPrefix: 'delete_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before deleting a folder.',
  })
  async deleteFolder(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.deleteFolder(folderId);
  }

  @Get(':folderId/all-posts')
  @RateLimit({
    keyPrefix: 'get_folder_posts',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before loading folder files.',
  })
  async getAllPostsInFolder(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.getAllPostsInFolder(folderId);
  }
}
