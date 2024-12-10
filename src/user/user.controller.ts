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

const FIND_ALL_POINTS = 20;
const FIND_BY_ID_POINTS = 20;
const PASSWORD_POINTS = 10;
const UPDATE_BY_ID_POINTS = 20;
const DELETE_BY_ID_POINTS = 20;

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RateLimit({
    keyPrefix: 'get_users',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching the users.',
  })
  getAll(@Query('confirm') confirm?: string, @Query('deptId') deptId?: number) {
    return this.userService.getAll(confirm, deptId);
  }

  @Get('employeeId')
  findByemployeeId(@Query('employeeId') employeeId: number) {
    return this.userService.getByEmployeeId(employeeId);
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'one_user',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching a user.',
  })
  getById(@Param('id') userId) {
    return this.userService.getById(userId);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_user_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before updating a user.',
  })
  updateById(@Param('id') userId, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_user_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before deleting a user.',
  })
  deleteById(@Param('id') userId) {
    return this.userService.deleteById(userId);
  }

  @Post('password')
  @RateLimit({
    keyPrefix: 'change_user_password',
    points: PASSWORD_POINTS,
    duration: 60,
    errorMessage: 'Please wait before changing the password.',
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    console.log(changePasswordDto);
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
  deactivateUser(
    @Query('password') password: string,
    @Query('employeeId') userId: number,
    @Query('deactivatorId') deactivatorId: number,
  ) {
    return this.userService.deactivateUser(password, userId, deactivatorId);
  }
}
