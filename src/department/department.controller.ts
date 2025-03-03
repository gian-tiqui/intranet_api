import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDeptDto } from './dto/update-department.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { FindAllDto } from 'src/utils/global-dto/global.dto';

@UseGuards(JwtAuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // Departments fetching endpoint
  @RateLimit({
    keyPrefix: 'get_departments',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before fetching the departments.',
  })
  @Get()
  findAll(@Query() query: FindAllDto) {
    return this.departmentService.findDepartments(query);
  }

  // One department fetcher endpoint
  @Get(':id')
  @RateLimit({
    keyPrefix: 'one_department',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before fetching a department.',
  })
  findById(@Param('id', ParseIntPipe) deptId: number) {
    return this.departmentService.findOneById(deptId);
  }

  // Department creation endpoint
  @Post()
  @RateLimit({
    keyPrefix: 'create_department',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before creating a department.',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_department_by_id',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before pupdating a department.',
  })
  updateById(
    @Param('id', ParseIntPipe) deptId: number,
    @Body() updateDeptDto: UpdateDeptDto,
  ) {
    return this.departmentService.updateById(deptId, updateDeptDto);
  }

  // Department deletion endpoint
  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_department_by_id',
    points: 150,
    duration: 20,
    errorMessage: 'Please wait before deleting a department.',
  })
  deleteById(@Param('id', ParseIntPipe) deptId: number) {
    return this.departmentService.deleteById(deptId);
  }
}
