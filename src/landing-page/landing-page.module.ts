import { Module } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { LandingPageController } from './landing-page.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [LandingPageController],
  providers: [LandingPageService, PrismaService],
})
export class LandingPageModule {}
