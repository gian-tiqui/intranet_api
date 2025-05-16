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
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { CreateFolderDto } from './create-folder.dto';
import { UpdateFolderDto } from './update-folder.dto';

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
  async getFolders(@Query() query: FindAllDto) {
    return this.folderService.getFolders(query);
  }

  @Post()
  @RateLimit({
    keyPrefix: 'create_main_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before creating a new folder.',
  })
  async createMainFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.folderService.createMainFolder(createFolderDto);
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
    @Body() createFolder: CreateFolderDto,
  ) {
    return this.folderService.createSubfolder(createFolder, parentId);
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

  @Get(':folderId/post')
  @RateLimit({
    keyPrefix: 'get_folder_posts',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before loading folder posts.',
  })
  async getFolderPostsByFolderId(
    @Param('folderId', ParseIntPipe) folderId: number,
    @Query() query: FindAllDto,
  ) {
    return this.folderService.getFolderPosts(folderId, query);
  }

  @Get(':folderId/subfolder')
  @RateLimit({
    keyPrefix: 'get_folder_subfolder',
    points: 150,
    duration: 10,
    errorMessage: `Please wait before loading folder's subfolder`,
  })
  getFolderSubfoldersByFolderId(
    @Param('folderId', ParseIntPipe) folderId,
    @Query() query: FindAllDto,
  ) {
    return this.folderService.getFolderSubfolders(folderId, query);
  }

  @Get(':folderId')
  @RateLimit({
    keyPrefix: 'get_folder',
    points: 150,
    duration: 10,
    errorMessage: 'Please wait before getting a folder.',
  })
  async getFolderById(
    @Param('folderId', ParseIntPipe) folderId: number,
    @Query('deptId', ParseIntPipe) deptId: number,
  ) {
    return this.folderService.getFolderById(folderId, deptId);
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
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.folderService.updateFolder(folderId, updateFolderDto);
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
