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
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

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
    @Param('parentId') parentId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.createSubfolder(name, parentId);
  }

  @Get(':folderId/posts')
  async getPostsByType(
    @Param('folderId') folderId: number,
    @Query('typeId') typeId?: number,
  ) {
    return this.folderService.getPostsByType(
      folderId,
      typeId ? +typeId : undefined,
    );
  }

  @Get(':folderId')
  async getFolderById(@Param('folderId') folderId: number) {
    return this.folderService.getFolderById(folderId);
  }

  @Put(':folderId')
  async updateFolder(
    @Param('folderId') folderId: number,
    @Body('name') name: string,
  ) {
    return this.folderService.updateFolder(folderId, name);
  }

  @Delete(':folderId')
  async deleteFolder(@Param('folderId') folderId: number) {
    return this.folderService.deleteFolder(folderId);
  }

  @Get(':folderId/all-posts')
  async getAllPostsInFolder(@Param('folderId') folderId: number) {
    return this.folderService.getAllPostsInFolder(folderId);
  }
}
