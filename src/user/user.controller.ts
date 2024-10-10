import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

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
    errorMessage: 'Please wait before posting again.',
  })
  getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  @RateLimit({
    keyPrefix: 'one_user',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  getById(@Param('id') userId) {
    return this.userService.getById(userId);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_user_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  updateById(@Param('id') userId, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_user_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  deleteById(@Param('id') userId) {
    return this.userService.deleteById(userId);
  }

  @Post('password')
  @RateLimit({
    keyPrefix: 'change_user_password',
    points: PASSWORD_POINTS,
    duration: 60,
    errorMessage: 'Please wait before posting again.',
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    console.log(changePasswordDto);
    return this.userService.changePassword(
      changePasswordDto.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
