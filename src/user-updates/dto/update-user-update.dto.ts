import { PartialType } from '@nestjs/mapped-types';
import { CreateUserUpdateDto } from './create-user-update.dto';

export class UpdateUserUpdateDto extends PartialType(CreateUserUpdateDto) {}
