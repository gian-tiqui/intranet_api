import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // Departments fetching endpoint
  @Get()
  findAll(@Query('departmentName') departmenName: string) {
    return this.departmentService.findAll(departmenName);
  }

  // Department creation endpoint
  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  // Department deletion endpoint
  @Delete(':id')
  deleteById(@Param('id') deptId: number) {
    return this.departmentService.deleteById(deptId);
  }
}
