import { Module } from '@nestjs/common';
import { ReactService } from './react.service';
import { ReactController } from './react.controller';

@Module({
  providers: [ReactService],
  controllers: [ReactController]
})
export class ReactModule {}
