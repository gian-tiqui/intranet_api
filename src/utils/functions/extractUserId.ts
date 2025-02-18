import { JwtService } from '@nestjs/jwt';

const extractUserId = (accessToken: string, jwtService: JwtService): number => {
  const { sub: userId }: { sub: number } = jwtService.decode(accessToken);

  return userId;
};

export default extractUserId;
