import { Test } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

describe('Departments controller testing', () => {
  let departmentService;
  let departmentController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [DepartmentService, PrismaService],
    }).compile();

    departmentService = moduleRef.get<DepartmentService>(DepartmentService);
    departmentController =
      moduleRef.get<DepartmentController>(DepartmentController);
  });

  describe('Service', () => {
    it('Should be defined', () => {
      expect(departmentService).toBeDefined();
    });
  });

  describe('Controller', () => {
    it('Should be defined', () => {
      expect(departmentController).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should fetch all departments', async () => {
      const results = [
        {
          deptId: 1,
          departmentName: 'IT',
        },
      ];

      jest
        .spyOn(departmentService, 'findAll')
        .mockImplementation(() => results);

      expect(await departmentController.findAll()).toBe(results);
    });
  });

  describe('findOne', () => {
    it('should return a department', async () => {
      const result = {
        deptId: 1,
        departmentName: 'IT',
      };

      jest
        .spyOn(departmentService, 'findOneById')
        .mockImplementation(() => result);

      expect(await departmentController.findById(1)).toBe(result);
    });
  });

  describe('createDepartment', () => {
    it('should create a new department', async () => {
      const createDepartmentDto: CreateDepartmentDto = {
        departmentName: 'IT',
      };

      const result = {
        message: 'Department added successfully',
        statusCode: 201,
        department: {
          deptId: 3,
          departmentName: 'HR',
        },
      };

      jest.spyOn(departmentService, 'create').mockImplementation(() => result);

      expect(await departmentController.create(createDepartmentDto)).toBe(
        result,
      );
    });
  });

  describe('deleteById', () => {
    it('should delete a post and return a success message', async () => {
      const postId = 47;

      jest
        .spyOn(departmentService, 'deleteById')
        .mockImplementation(() => Promise.resolve());

      await expect(
        departmentController.deleteById(postId),
      ).resolves.toBeUndefined();
    });
  });
});
