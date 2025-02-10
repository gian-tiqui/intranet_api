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
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching all unread notifications.',
  })
  @Get()
  async getFolders() {
    return this.folderService.getFolders();
  }

  @Post()
  async createMainFolder(@Body('name') name: string) {
    return this.folderService.createMainFolder(name);
  }

  @Post(':parentId/subfolder')
  async createSubfolder(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.createSubfolder(name, parentId);
  }

  @Get(':folderId/posts')
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
  async getFolderById(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.getFolderById(folderId);
  }

  @Put(':folderId')
  async updateFolder(
    @Param('folderId', ParseIntPipe) folderId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.updateFolder(folderId, name);
  }

  @Delete(':folderId')
  async deleteFolder(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.deleteFolder(folderId);
  }

  @Get(':folderId/all-posts')
  async getAllPostsInFolder(@Param('folderId', ParseIntPipe) folderId: number) {
    return this.folderService.getAllPostsInFolder(folderId);
  }
}
