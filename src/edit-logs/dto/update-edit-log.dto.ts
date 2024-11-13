import { PartialType } from '@nestjs/mapped-types';
import { CreateEditLogDto } from './create-edit-log.dto';

export class UpdateEditLogDto extends PartialType(CreateEditLogDto) {}
