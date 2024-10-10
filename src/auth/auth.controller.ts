import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Register user endpoint
  @Post('register')
  @RateLimit({
    keyPrefix: 'sign-up',
    points: 1,
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
    points: 5,
    duration: 60,
    errorMessage: 'Please wait before logging in again.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Refresh token removal in the user data endpoint
  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.userId);
  }

  // Access token generation when refresh token is still valid endpoint
  @Post('refresh')
  @RateLimit({
    keyPrefix: 'refresh-token',
    points: 10,
    duration: 60,
    errorMessage: 'Please wait before refreshing your token again.',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }
}
