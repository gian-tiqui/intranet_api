import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserIdDto } from './dto/user-id.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get(':id')
  getById(@Param('id') userIdDto: UserIdDto) {
    return this.userService.getById(userIdDto);
  }
}
