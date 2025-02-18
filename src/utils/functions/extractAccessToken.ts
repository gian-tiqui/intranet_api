import { BadRequestException } from '@nestjs/common';

const extractAccessToken = (req: Request): string => {
  if (!req.headers['authorization'])
    throw new BadRequestException(`Authorization header missing.`);
  return req.headers['authorization'].split(' ')[1];
};

export default extractAccessToken;
