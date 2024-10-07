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
import { ReactModule } from './react/react.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthModule,
    UserModule,
    PostModule,
    PostModule,
    DepartmentModule,
    CommentModule,
    NotificationModule,
    ReactModule,
  ],
})
export class AppModule {}
