import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserUpdatesService } from './user-updates.service';
import { FindAllDto } from 'src/utils/global-dto/global.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import errorHandler from 'src/utils/functions/errorHandler';
import extractAccessToken from 'src/utils/functions/extractAccessToken';

@UseGuards(JwtAuthGuard)
@Controller('user-updates')
export class UserUpdatesController {
  private logger: Logger = new Logger(UserUpdatesController.name);

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
  approveUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ) {
    try {
      const accessToken = extractAccessToken(req);

      if (!accessToken)
        throw new BadRequestException(`Access token is required`);

      return this.userUpdatesService.approveUserUpdate(userId, accessToken);
    } catch (error) {
      errorHandler(error, this.logger);
    }
  }

  @RateLimit({
    keyPrefix: 'reject_user_update',
    points: 150,
    duration: 60,
    errorMessage: 'Please wait rejecting the updates of a user.',
  })
  @Delete(':userUpdateId')
  rejectUpdate(@Param('userUpdateId', ParseIntPipe) userUpdateId: number) {
    return this.userUpdatesService.rejectUpdates(userUpdateId);
  }
}
