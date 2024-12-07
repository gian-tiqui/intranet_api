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

@Injectable()
export class AuthService {
  private accounts;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {
    this.accounts = [
      {
        email: 'gian.tiqui.dev@gmail.com',
        password: 'password',
        firstName: 'Hr',
        middleName: '',
        lastName: 'Head',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Female',
        deptId: 1,
        employeeId: 1111,
        lid: 3,
      },
      {
        email: 'gian.tiqui.dev@gmail.com',
        password: 'password',
        firstName: 'IT',
        middleName: '',
        lastName: 'Head',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Female',
        deptId: 3,
        employeeId: 1112,
        lid: 3,
      },
      {
        email: 'gian.tiqui.dev@gmail.com',
        password: 'password',
        firstName: 'IT',
        middleName: '',
        lastName: 'IT',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 3,
        employeeId: 1113,
        lid: 2,
      },
      {
        email: 'gian.tiqui.dev@gmail.com',
        password: 'password',
        firstName: 'IT2',
        middleName: '',
        lastName: 'IT2',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 3,
        employeeId: 1114,
        lid: 2,
      },
      {
        email: 'it3@gmail.com',
        password: 'password',
        firstName: 'IT3',
        middleName: '',
        lastName: 'IT3',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 3,
        employeeId: 1115,
        lid: 1,
      },
      {
        email: 'gian.tiqui.dev@gmail.com',
        password: 'password',
        firstName: 'Meow',
        middleName: '',
        lastName: 'Meow',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 3,
        employeeId: 1116,
        lid: 1,
      },
      {
        email: 'gian.tiqui.dev333@gmail.com',
        password: 'password',
        firstName: 'Hr',
        middleName: '',
        lastName: 'Staff',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 1,
        employeeId: 1117,
        lid: 1,
      },
      {
        email: 'gian.tiqui.dev3333@gmail.com',
        password: 'password',
        firstName: 'QM',
        middleName: '',
        lastName: 'Staff',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 2,
        employeeId: 1118,
        lid: 1,
      },
      {
        email: 'gian.tiqui.dev3333@gmail.com',
        password: 'password',
        firstName: 'QM',
        middleName: '',
        lastName: 'Head',
        lastNamePrefix: '',
        preferredName: '',
        suffix: '',
        address: '123 Elm St.',
        city: 'Springfield',
        state: 'IL',
        zipCode: 4000,
        dob: new Date(),
        gender: 'Male',
        deptId: 2,
        employeeId: 1119,
        lid: 3,
      },
    ];
  }

  async fetchDataByEmployeeId(employeeId: number) {
    let data: RegisterDto[];

    try {
      const rawData = fs.readFileSync(
        this.configService.get('EMPLOYEE_IDS_PATH'),
        'utf-8',
      );
      data = JSON.parse(rawData).employeesData;
    } catch (error) {
      console.error(error);
      data = this.accounts;
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

    const found = data.find(
      (employee) => employee.employeeId === Number(employeeId),
    );

    if (!found) {
      throw new NotFoundException(`ID ${employeeId} not found.`);
    }

    const signedId = await this.signEmployeeId(found.employeeId);

    // Write a line here that will find the email of the user with the same dept ID and add a approver field so it will send to that user with the approver field with the value of true

    const approver = await this.prisma.user.findFirst({
      where: {
        AND: {
          deptId: Number(found.deptId),
          lid: 2,
        },
      },
    });

    await this.mailerService.sendMail({
      to: approver.email,
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

  async forgotPassword(employeeId: number, secretCode: string, deptId: number) {
    return {
      employeeId: +employeeId,
      secretCode,
      deptId: +deptId,
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
