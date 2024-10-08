import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateDeptDto } from './dto/update-department.dto';

@UseGuards(JwtAuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // Departments fetching endpoint
  @Get()
  findAll(@Query('departmentName') departmenName: string) {
    return this.departmentService.findAll(departmenName);
  }

  // One department fetcher endpoint
  @Get(':id')
  findById(@Param('id') deptId: number) {
    return this.departmentService.findOneById(deptId);
  }

  // Department creation endpoint
  @Post()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  updateById(@Param('id') deptId, @Body() updateDeptDto: UpdateDeptDto) {
    return this.departmentService.updateById(deptId, updateDeptDto);
  }

  // Department deletion endpoint
  @Delete(':id')
  deleteById(@Param('id') deptId: number) {
    return this.departmentService.deleteById(deptId);
  }
}
