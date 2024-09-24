import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { DepartmentModule } from './department/department.module';
import { ServiceController } from './service/service.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostModule,
    DepartmentModule,
  ],
  controllers: [ServiceController],
  providers: [],
})
export class AppModule {}
