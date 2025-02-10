import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { LogoutDto } from './dto/logout.dto';

const REGISTER_LIMIT = 5;
const VERIFY_LIMIT = 5;
const LOGIN_LIMIT = 10;
const LOGOUT_LIMIT = 5;
const REFRESH_LIMIT = 1000;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('user')
  findByEmployeeId(@Query('employeeId') employeeId: number) {
    return this.authService.fetchDataByEmployeeId(employeeId);
  }

  // Verify if id exists in the users data file
  @Post('verify')
  @RateLimit({
    keyPrefix: 'verify',
    points: VERIFY_LIMIT,
    duration: 60,
    errorMessage: 'Please wait before entering an id.',
  })
  verify(@Query('employeeId', ParseIntPipe) employeeId: number) {
    return this.authService.verify(employeeId);
  }

  // Register user endpoint
  @Post('register')
  @RateLimit({
    keyPrefix: 'sign-up',
    points: REGISTER_LIMIT,
    duration: 60,
    errorMessage: 'Please wait before creating an account again.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // User validation and token generation endpoint
  @Post('login')
  @RateLimit({
    keyPrefix: 'sign-in',
    points: LOGIN_LIMIT,
    duration: 60,
    errorMessage: 'Please wait before logging in again.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Refresh token removal in the user data endpoint
  @Post('logout')
  @RateLimit({
    keyPrefix: 'logout',
    points: LOGOUT_LIMIT,
    duration: 60,
    errorMessage: 'Please wait before logging out again.',
  })
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.userId);
  }

  // Access token generation when refresh token is still valid endpoint
  @Post('refresh')
  @RateLimit({
    keyPrefix: 'refresh-token',
    points: REFRESH_LIMIT,
    duration: 60,
    errorMessage: 'Please wait before refreshing your token again.',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Post('forgot-password')
  forgotPassword(
    @Query('employeeId', ParseIntPipe) employeeId: number,
    @Query('answer') answer: string,
    @Query('newPassword', ParseIntPipe) newPassword: string,
  ) {
    return this.authService.forgotPassword(employeeId, answer, newPassword);
  }
}
