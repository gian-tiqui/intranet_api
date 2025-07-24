import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserUpdatesService } from './user-updates.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-updates')
export class UserUpdatesController {
  constructor(private readonly userUpdatesService: UserUpdatesService) {}

  @RateLimit({
    keyPrefix: 'get_user_updates',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait before fetching your updates.',
  })
  @Get()
  findAll(@Query() findAllDto: FindAllDto) {
    return this.userUpdatesService.findAll(findAllDto);
  }

  @RateLimit({
    keyPrefix: 'approve_user_updates',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait approving the updates of a user.',
  })
  @Patch(':userId/user')
  approveUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userUpdatesService.approveUserUpdate(userId);
  }
}
