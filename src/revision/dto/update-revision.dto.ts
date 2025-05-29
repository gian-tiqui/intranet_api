import { PartialType } from '@nestjs/mapped-types';
import { CreateRevisionDto } from './create-revision.dto';

export class UpdateRevisionDto extends PartialType(CreateRevisionDto) {}
