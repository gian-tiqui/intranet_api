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
import { UpdateDeptDto } from './dto/update-department.dto';
import { RateLimit } from 'nestjs-rate-limiter';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

const FIND_ALL_POINTS = 50;
const FIND_BY_ID_POINTS = 50;
const CREATE_POINTS = 5;
const UPDATE_BY_ID_POINTS = 10;
const DELETE_BY_ID_POINTS = 10;

@UseGuards(JwtAuthGuard)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // Departments fetching endpoint
  @RateLimit({
    keyPrefix: 'get_departments',
    points: FIND_ALL_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching the departments.',
  })
  @Get()
  findAll(@Query('departmentName') departmenName: string) {
    return this.departmentService.findAll(departmenName);
  }

  // One department fetcher endpoint

  @Get(':id')
  @RateLimit({
    keyPrefix: 'one_department',
    points: FIND_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before fetching a department.',
  })
  findById(@Param('id') deptId: number) {
    return this.departmentService.findOneById(deptId);
  }

  // Department creation endpoint
  @Post()
  @RateLimit({
    keyPrefix: 'create_department',
    points: CREATE_POINTS,
    duration: 60,
    errorMessage: 'Please wait before creating a department.',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Put(':id')
  @RateLimit({
    keyPrefix: 'update_department_by_id',
    points: UPDATE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before pupdating a department.',
  })
  updateById(@Param('id') deptId, @Body() updateDeptDto: UpdateDeptDto) {
    return this.departmentService.updateById(deptId, updateDeptDto);
  }

  // Department deletion endpoint
  @Delete(':id')
  @RateLimit({
    keyPrefix: 'delete_department_by_id',
    points: DELETE_BY_ID_POINTS,
    duration: 60,
    errorMessage: 'Please wait before deleting a department.',
  })
  deleteById(@Param('id') deptId: number) {
    return this.departmentService.deleteById(deptId);
  }
}
