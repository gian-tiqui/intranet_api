import { Test } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { PrismaService } from '../prisma/prisma.service';

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
});
