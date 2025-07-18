import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.AT_SECRET,
      signOptions: { expiresIn: process.env.AT_EXP },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, LoggerService],
  controllers: [AuthController],
})
export class AuthModule {}
