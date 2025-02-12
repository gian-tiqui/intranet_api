import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import sanitize from 'src/utils/functions/sanitize';
import sanitizeSQL from 'src/utils/functions/sanitizeSQL';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => sanitize(value))
  @Transform(({ value }) => sanitizeSQL(value))
  refreshToken: string;
}
