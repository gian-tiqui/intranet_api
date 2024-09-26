import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/post/common/MulterOption';
import { UpdateCommentDto } from './dto/update-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findById(@Param('id') cid: number) {
    return this.commentService.findOneById(cid);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('commentImage', {
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  create(
    @Body() createCommentDto: CreateCommentDto,
    @UploadedFile() commentImage: Express.Multer.File,
  ) {
    return this.commentService.create(createCommentDto, commentImage);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('commentImage', {
      limits: { fileSize: 1024 * 1024 * 10 },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/jpg',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
      storage: multerOptions('comment').storage,
    }),
  )
  updateById(
    @Param('id') cid,
    @Body() updateCommentDto: UpdateCommentDto,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    return this.commentService.updateById(cid, updateCommentDto, newImage);
  }
}
