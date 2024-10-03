import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  getById(@Param('id') userId) {
    return this.userService.getById(userId);
  }

  @Put(':id')
  updateById(@Param('id') userId, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Delete(':id')
  deleteById(@Param('id') userId) {
    return this.userService.deleteById(userId);
  }
}
