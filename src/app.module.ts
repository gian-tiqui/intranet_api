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
import { LevelModule } from './level/level.module';
import { PostDepartmentModule } from './post-department/post-department.module';
import { EditLogsModule } from './edit-logs/edit-logs.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { FolderModule } from './folder/folder.module';
import { DivisionModule } from './division/division.module';
import { LoggerService } from './logger/logger.service';
import { SearchModule } from './search/search.module';
import { RevisionModule } from './revision/revision.module';
import { PostTypesModule } from './post-types/post-types.module';
import { LandingPageModule } from './landing-page/landing-page.module';
import { IncidentReportModule } from './incident-report/incident-report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@meow.com>',
      },
      template: {
        dir: join(__dirname, '..', 'src', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
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
    LevelModule,
    PostDepartmentModule,
    EditLogsModule,
    FolderModule,
    DivisionModule,
    SearchModule,
    RevisionModule,
    PostTypesModule,
    LandingPageModule,
    IncidentReportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    LoggerService,
  ],
  controllers: [AppController],
})
export class AppModule {}
