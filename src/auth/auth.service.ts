import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as argon from 'argon2';
import { LoggerService } from 'src/logger/logger.service';
import errorHandler from 'src/utils/functions/errorHandler';

@Injectable()
export class AuthService {
  private accounts;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly logger: LoggerService,
  ) {
    this.accounts = [
      // ... your existing accounts array
    ];
  }

  async fetchDataByEmployeeId(employeeId: string) {
    let data: RegisterDto[];

    try {
      const rawData = fs.readFileSync(
        this.configService.get('EMPLOYEE_IDS_PATH'),
        'utf-8',
      );
      data = JSON.parse(rawData).employeesData;
    } catch (error) {
      console.error(error);
      this.logger.error('There was an error in fetching employee data', error);

      data = this.accounts;
    }

    const found = data.find((employee) => employee.employeeId === employeeId);

    if (found) {
      return found;
    }

    throw new NotFoundException('Data not found');
  }

  async verify(employeeId: string) {
    const user = await this.prisma.user.findFirst({
      where: { employeeId },
    });

    if (user && user.confirmed == false)
      throw new HttpException('This account is already pending', 404);

    if (user) throw new HttpException('This account is already activated', 404);

    let data: RegisterDto[];

    try {
      const rawData = fs.readFileSync(
        this.configService.get('EMPLOYEE_IDS_PATH'),
        'utf-8',
      );
      data = JSON.parse(rawData).employeesData;

      if (!data || data.length === 0) {
        throw new Error(
          'Employee data is empty or not found in the JSON file.',
        );
      }
    } catch (error) {
      console.error('Error reading or parsing employee data:', error);
      data = this.accounts;
    }

    const found = data.find((employee) => employee.employeeId === employeeId);

    if (!found) {
      throw new NotFoundException(`ID ${employeeId} not found.`);
    }

    const signedId = await this.signEmployeeId(found.employeeId);

    const approver = await this.prisma.user.findFirst({
      where: {
        AND: {
          deptId: Number(found.deptId),
          lid: 2,
        },
      },
    });

    if (!approver)
      return new BadRequestException('No supervisor yet for this department.');

    await this.mailerService.sendMail({
      to: approver.email,
      subject: 'WMC Intranet Activation',
      template: 'registration',
      context: {
        name: found.firstName,
        id: signedId,
      },
    });

    return {
      message:
        'Your ID was found. Please check your email for the activation link.',
      statusCode: 200,
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await argon.hash(registerDto.password);
    const formattedDob = new Date(registerDto.dob).toISOString();

    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          middleName: registerDto.middleName,
          lastName: registerDto.lastName,
          dob: formattedDob,
          gender: registerDto.gender,
          address: registerDto.address,
          city: registerDto.city,
          lastNamePrefix: registerDto.lastNamePrefix,
          state: registerDto.state,
          suffix: registerDto.suffix,
          zipCode: registerDto.zipCode,
          preferredName: registerDto.preferredName,
          deptId: registerDto.deptId,
          employeeId: registerDto.employeeId,
          lid: registerDto.lid,
          confirmed: registerDto.lid >= 2,
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
      this.logger.error('There was a problem in registering a user: ', error);
      throw new ConflictException('User already exists');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { employeeId: loginDto.employeeId },
        include: { department: true },
      });

      if (!user) {
        throw new UnauthorizedException(`User not found`);
      }

      const isPasswordValid = await argon.verify(
        user.password,
        loginDto.password,
      );

      if (!isPasswordValid) throw new UnauthorizedException('Password invalid');

      // Clean up old refresh tokens (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
          lastUsedAt: { lt: thirtyDaysAgo },
        },
      });

      const accessToken = await this.signToken(
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.department,
        user.lid,
        user.confirmed,
        user.isFirstLogin,
      );

      // Always generate a new refresh token for each login
      const refreshToken = await this.signRefreshToken(user.id);

      if (user.confirmed) {
        // Store the new refresh token in the RefreshToken table
        await this.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
          },
        });
      }

      await this.prisma.loginLogs.create({
        data: {
          userId: user.id,
        },
      });

      return {
        message: 'Login successful',
        statusCode: 200,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      this.logger.error('There was a problem in logging in: ', error);
      throw error;
    }
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      if (!refreshToken) {
        throw new BadRequestException('No token provided');
      }

      // Verify the refresh token JWT first
      let payload;
      try {
        const refreshTokenSecret = this.configService.get<string>('RT_SECRET');
        payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: refreshTokenSecret,
        });
      } catch (error) {
        this.logger.error(`Invalid Refresh Token Error :`, error);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Find the refresh token in the RefreshToken table
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            include: { department: true },
          },
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Update last used timestamp
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: new Date() },
      });

      const user = tokenRecord.user;

      const accessToken = await this.signToken(
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        user.department,
        user.lid,
        user.confirmed,
        user.isFirstLogin,
      );

      return { access_token: accessToken };
    } catch (error) {
      this.logger.error('There was a problem in refreshing the token', error);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required for logout');
      }

      // Delete the specific refresh token (logout from current device only)
      const deletedToken = await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      if (!deletedToken) {
        throw new BadRequestException('Invalid refresh token');
      }

      return {
        message: 'Logged out successful',
        statusCode: 204,
      };
    } catch (error) {
      this.logger.error('There was a problem in logging out: ', error);
      throw error;
    }
  }

  // New method: Logout from all devices
  async logoutAll(userId: number) {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      return {
        message: 'Logged out from all devices successfully',
        statusCode: 204,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in logging out from all devices: ',
        error,
      );
      throw error;
    }
  }

  // New method: Get active sessions
  async getActiveSessions(userId: number) {
    try {
      const sessions = await this.prisma.refreshToken.findMany({
        where: { userId },
        select: {
          id: true,
          createdAt: true,
          lastUsedAt: true,
        },
        orderBy: { lastUsedAt: 'desc' },
      });

      return {
        message: 'Active sessions retrieved successfully',
        sessions,
      };
    } catch (error) {
      this.logger.error(
        'There was a problem retrieving active sessions: ',
        error,
      );
      throw error;
    }
  }

  // New method: Revoke specific session
  async revokeSession(userId: number, sessionId: string) {
    try {
      const deletedToken = await this.prisma.refreshToken.delete({
        where: {
          id: sessionId,
          userId: userId, // Ensure user can only revoke their own sessions
        },
      });

      if (!deletedToken) {
        throw new NotFoundException('Session not found');
      }

      return {
        message: 'Session revoked successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error('There was a problem revoking the session: ', error);
      throw error;
    }
  }

  async forgotPassword(
    employeeId: string,
    answer: string,
    newPassword: string,
    secretQuestion1: string,
  ) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { employeeId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isAnswerCorrect = await argon.verify(user.secretAnswer1, answer);
      if (!isAnswerCorrect) {
        throw new BadRequestException('Incorrect answer');
      }

      const isQuestionMatching = await argon.verify(
        user.secretQuestion1,
        secretQuestion1,
      );
      if (!isQuestionMatching) {
        throw new BadRequestException(`Incorrect question`);
      }

      if (newPassword.length < 8) {
        throw new BadRequestException(
          'Password must be at least 8 characters long',
        );
      }

      const hashedPassword = await argon.hash(newPassword);

      // Update password and invalidate all refresh tokens for security
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { employeeId },
          data: { password: hashedPassword },
        }),
        this.prisma.refreshToken.deleteMany({
          where: {
            user: { employeeId },
          },
        }),
      ]);

      return {
        message:
          'Password reset successfully. Please login again on all devices.',
      };
    } catch (error) {
      this.logger.error(
        'There was a problem in retrieving the password: ',
        error,
      );
      throw error;
    }
  }

  private async signToken(
    userId: number,
    firstName: string,
    lastName: string,
    email: string,
    department: {
      departmentName: string;
      deptId: number;
      departmentCode: string;
    },
    lid: number,
    confirmed: boolean,
    isFirstLogin: boolean,
  ): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      departmentCode: department.departmentCode,
      deptId: department.deptId,
      firstName,
      lastName,
      lid,
      departmentName: department.departmentName,
      confirmed,
      isFirstLogin,
    });
  }

  private async signRefreshToken(userId: number): Promise<string> {
    const refreshTokenSecret = this.configService.get<string>('RT_SECRET');
    const refreshTokenExpiration = this.configService.get<string>('RT_EXP');

    return this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: refreshTokenExpiration, secret: refreshTokenSecret },
    );
  }

  private async signEmployeeId(employeeId: string): Promise<string> {
    const employeeIdSecret =
      this.configService.get<string>('EMPLOYEE_ID_SECRET');
    const employeeIdExp = this.configService.get<string>(
      'EMPLOYEE_ID_SECRET_EXP',
    );

    return this.jwtService.signAsync(
      { sub: employeeId },
      { expiresIn: employeeIdExp, secret: employeeIdSecret },
    );
  }

  lockUserLogin = async (employeeId: string) => {
    try {
      const user = await this.prisma.user.findFirst({ where: { employeeId } });

      if (!user)
        throw new NotFoundException(
          `User with the id ${employeeId} not found.`,
        );

      // Deactivate user and invalidate all their refresh tokens
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { employeeId },
          data: { confirmed: false },
        }),
        this.prisma.refreshToken.deleteMany({
          where: { userId: user.id },
        }),
      ]);

      return {
        message: 'User deactivated successfully',
      };
    } catch (error) {
      errorHandler(error, this.logger);
    }
  };
}
