import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  newPassword: string;
}
