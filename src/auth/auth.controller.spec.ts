import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: process.env.AT_SECRET,
          signOptions: { expiresIn: process.env.AT_EXP },
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, PrismaService, JwtService, ConfigService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(authService).toBeDefined();
    });
  });

  describe('to be defined', () => {
    it('should be defined', () => {
      expect(authController).toBeDefined();
    });
  });
});
