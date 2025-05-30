import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { AddUserDto } from './dto/add-user.dto';
import errorHandler from 'src/utils/functions/errorHandler';
import { LoggerService } from 'src/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import extractAccessToken from 'src/utils/functions/extractAccessToken';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private logger: LoggerService,
    private jwtService: JwtService,
  ) {}

  @Post()
  @RateLimit({
    keyPrefix: 'add_user',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before adding a new user.',
  })
  addUser(@Body() addUserDto: AddUserDto, @Req() req: Request) {
    try {
      const accessToken = extractAccessToken(req);

      if (!accessToken)
        throw new BadRequestException(`Access token is required`);

      return this.userService.addUser(addUserDto, accessToken);
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  @Post(':userId/upload')
  @RateLimit({
    keyPrefix: 'upload_picture',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before uploading user picture',
  })
  uploadProfilePicture(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.userService.uploadUserProfile(userId, files);
  }

  @Get()
  @RateLimit({
    keyPrefix: 'get_users',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching the users.',
  })
  getAll(@Query() query: FindAllDto) {
    return this.userService.getAll(query);
  }

  @Get('employeeId')
  @RateLimit({
    keyPrefix: 'get_user',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching an employee.',
  })
  findByEmployeeId(@Query('employeeId') employeeId: string) {
    return this.userService.getByEmployeeId(employeeId);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'get_user_byId',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching a user.',
  })
  getById(@Param('id') userId) {
    return this.userService.getById(userId);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_user_by_id',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before updating a user.',
  })
  updateById(@Param('id') userId, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_user_by_id',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before deleting a user.',
  })
  deleteById(@Param('id') userId) {
    return this.userService.deleteById(userId);
  }

  @Post('password')
  @RateLimit({
    keyPrefix: 'change_user_password',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before changing the password.',
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @RateLimit({
    keyPrefix: 'get_user_history',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching user history.',
  })
  @Get('history/:id')
  getPostReadsById(
    @Param('id') userId: number,
    @Query('search') search: string,
  ) {
    return this.userService.getPostReadsById(userId, search);
  }

  @Post('deactivate')
  @RateLimit({
    keyPrefix: 'deactivate_user',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before deactivating user password.',
  })
  deactivateUser(
    @Query('password') password: string,
    @Query('employeeId') userId: string,
    @Query('deactivatorId', ParseIntPipe) deactivatorId: number,
  ) {
    return this.userService.deactivateUser(password, userId, deactivatorId);
  }

  @RateLimit({
    keyPrefix: 'set_secret_question',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before setting new question.',
  })
  @Post('secret-question')
  setSecretQuestion(
    @Query('question') question: string,
    @Query('answer') answer: string,
    @Query('userId') userId: number,
  ) {
    return this.userService.setSecretQuestion(question, answer, userId);
  }

  @RateLimit({
    keyPrefix: 'set_secret_question',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before setting new question.',
  })
  @Get(':userId/drafts')
  getDraftsById(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindAllDto,
  ) {
    return this.userService.getDraftsByUserID(userId, query);
  }
}
