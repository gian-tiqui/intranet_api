import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'get_users',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching the users.',
  })
  getAll(@Query('confirm') confirm?: string, @Query('deptId') deptId?: number) {
    return this.userService.getAll(confirm, deptId);
  }

  @Get('employeeId')
  @RateLimit({
    keyPrefix: 'get_user',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching an employee.',
  })
  findByEmployeeId(@Query('employeeId') employeeId: number) {
    return this.userService.getByEmployeeId(employeeId);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'get_user_byId',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before fetching a user.',
  })
  getById(@Param('id') userId) {
    return this.userService.getById(userId);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_user_by_id',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before updating a user.',
  })
  updateById(@Param('id') userId, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_user_by_id',
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before deleting a user.',
  })
  deleteById(@Param('id') userId) {
    return this.userService.deleteById(userId);
  }

  @Post('password')
  @RateLimit({
    keyPrefix: 'change_user_password',
    points: 50,
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
    points: 50,
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
    points: 50,
    duration: 60,
    errorMessage: 'Please wait before deactivating user password.',
  })
  deactivateUser(
    @Query('password') password: string,
    @Query('employeeId') userId: number,
    @Query('deactivatorId') deactivatorId: number,
  ) {
    return this.userService.deactivateUser(password, userId, deactivatorId);
  }

  @RateLimit({
    keyPrefix: 'set_secret_question',
    points: 5,
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
}
