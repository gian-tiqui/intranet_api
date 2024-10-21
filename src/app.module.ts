import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { DepartmentModule } from './department/department.module';
import { CommentModule } from './comment/comment.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { NotificationModule } from './notification/notification.module';
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter';
import { APP_GUARD } from '@nestjs/core';
import { PostReaderModule } from './post-reader/post-reader.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    RateLimiterModule,
    AuthModule,
    UserModule,
    PostModule,
    PostModule,
    DepartmentModule,
    CommentModule,
    NotificationModule,
    PostReaderModule,
    MonitoringModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
