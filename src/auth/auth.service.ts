import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await argon.hash(registerDto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          middleName: registerDto.middleName,
          lastName: registerDto.lastName,
          dob: registerDto.dob,
          gender: registerDto.gender,
          address: registerDto.address,
          city: registerDto.city,
          lastNamePrefix: registerDto.lastNamePrefix,
          state: registerDto.state,
          suffix: registerDto.suffix,
          zipCode: registerDto.zipCode,
          preferredName: registerDto.preferredName,
          deptId: registerDto.deptId,
        },
      });

      const { password, ...result } = user;

      console.log(password[0]);

      return {
        message: 'Registration successful',
        statusCode: 201,
        user: result,
      };
    } catch (error) {
      console.error(error);
      throw new ConflictException('User already exists');
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !(await argon.verify(user.password, loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.signToken(user.id, user.email);
    const refreshToken = await this.signRefreshToken(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      message: 'Login successful',
      statusCode: 200,
      tokens: { accessToken, refreshToken },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.signToken(user.id, user.email);

    return { access_token: accessToken };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private async signToken(userId: number, email: string): Promise<string> {
    return this.jwtService.signAsync({ sub: userId, email });
  }

  private async signRefreshToken(userId: number): Promise<string> {
    const refreshTokenSecret = this.configService.get<string>('RT_SECRET');
    const refreshTokenExpiration = this.configService.get<string>('RT_EXP');

    return this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: refreshTokenExpiration, secret: refreshTokenSecret },
    );
  }
}
