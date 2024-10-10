import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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

  // Create user upon successful validation and hash the password using the mechanism of argon package
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

      const res = { ...user };

      delete res.password;

      return {
        message: 'Registration successful',
        statusCode: 201,
        user: res,
      };
    } catch (error) {
      console.error(error);
      throw new ConflictException('User already exists');
    }
  }

  // Check if the user exists and the password is correct if the user exists and generate tokens for the app to use
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException(`User not found`);
    }

    const isPasswordValid = await argon.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password invalid');
    }

    const accessToken = await this.signToken(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.department,
    );

    let refreshToken: string;

    if (user.refreshToken) {
      refreshToken = user.refreshToken;
    } else {
      refreshToken = await this.signRefreshToken(user.id);
    }

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

  // Validate if the refresh token exists in the user data and generate a new access token if valid
  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new BadRequestException('No token provided');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
      include: { department: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.signToken(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.department,
    );

    return { access_token: accessToken };
  }

  // Remove the refresh token of the user upon logout
  async logout(userId: number) {
    const logout = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    if (!logout) throw new ConflictException('Could not log you out');

    return {
      message: 'Logged out successful',
      statusCode: 204,
    };
  }

  // This generates the access token with payloads in the args
  private async signToken(
    userId: number,
    firstName: string,
    lastName: string,
    email: string,
    department: { departmentName: string; deptId: number },
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      departmentName: department.departmentName,
      deptId: department.deptId,
      firstName,
      lastName,
    });
  }

  // This generates the refresh token of the user with payload of the access token and exp of the refresh token
  private async signRefreshToken(userId: number): Promise<string> {
    const refreshTokenSecret = this.configService.get<string>('RT_SECRET');
    const refreshTokenExpiration = this.configService.get<string>('RT_EXP');

    return this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: refreshTokenExpiration, secret: refreshTokenSecret },
    );
  }
}
