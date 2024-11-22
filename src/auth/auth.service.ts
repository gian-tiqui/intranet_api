import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException,
  InternalServerErrorException,
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
import * as path from 'path';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async fetchDataByEmployeeId(employeeId: number) {
    let data: RegisterDto[];

    const filePath = path.join(__dirname, '../data/employee-ids.json');

    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(rawData).employeesData;
    } catch (error) {
      console.error(error);
    }

    const found = data.find(
      (employee) => employee.employeeId === Number(employeeId),
    );

    if (found) {
      return found;
    }

    throw new NotFoundException('Data not found');
  }

  async verify(employeeId: number) {
    const user = await this.prisma.user.findFirst({
      where: { employeeId: Number(employeeId) },
    });

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
      throw new InternalServerErrorException('Unable to verify employee ID.');
    }

    const found = data.find(
      (employee) => employee.employeeId === Number(employeeId),
    );

    if (!found) {
      throw new NotFoundException(`ID ${employeeId} not found.`);
    }

    const signedId = await this.signEmployeeId(found.employeeId);

    await this.mailerService.sendMail({
      to: found.email,
      subject: 'Welcome to Our Service',
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

  // Create user upon successful validation and hash the password using the mechanism of argon package
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
      throw new ConflictException('User already exists');
    }
  }

  // Check if the user exists and the password is correct if the user exists and generate tokens for the app to use
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId: Number(loginDto.employeeId) },
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
      user.lid,
      user.confirmed,
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
      user.lid,
      user.confirmed,
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
    department: {
      departmentName: string;
      deptId: number;
      departmentCode: string;
    },
    lid: number,
    confirmed: boolean,
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

  private async signEmployeeId(employeeId: number): Promise<string> {
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
}
