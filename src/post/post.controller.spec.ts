import { Test } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Post endpoints testing', () => {
  let postService;
  let postController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService, PrismaService],
    }).compile();

    postService = moduleRef.get<PostService>(PostService);
    postController = moduleRef.get<PostController>(PostController);
  });

  describe('findAll', () => {
    it('should return posts', async () => {
      const results = [
        {
          pid: 47,
          userId: 2,
          deptId: 1,
          message: 'updated post',
          imageLocation: 'uploads/1727241633011-365550808-download.jpg',
          createdAt: '2024-09-25T05:20:33.019Z',
          updatedAt: '2024-09-25T05:23:40.742Z',
        },
        {
          pid: 48,
          userId: 2,
          deptId: 1,
          message: 'updated post',
          imageLocation: 'uploads/1727241633011-365550808-download.jpg',
          createdAt: '2024-09-25T05:20:33.019Z',
          updatedAt: '2024-09-25T05:23:40.742Z',
        },
        {
          pid: 49,
          userId: 2,
          deptId: 1,
          message: 'updated post',
          imageLocation: 'uploads/1727241633011-365550808-download.jpg',
          createdAt: '2024-09-25T05:20:33.019Z',
          updatedAt: '2024-09-25T05:23:40.742Z',
        },
        {
          pid: 50,
          userId: 2,
          deptId: 1,
          message: 'updated post',
          imageLocation: 'uploads/1727241633011-365550808-download.jpg',
          createdAt: '2024-09-25T05:20:33.019Z',
          updatedAt: '2024-09-25T05:23:40.742Z',
        },
      ];

      jest.spyOn(postService, 'findAll').mockImplementation(() => results);

      expect(await postController.findAll()).toBe(results);
    });
  });

  describe('findOne', () => {
    it('should return a single post', async () => {
      const result = {
        pid: 47,
        userId: 2,
        deptId: 1,
        message: 'updated post',
        imageLocation: 'uploads/1727241633011-365550808-download.jpg',
        createdAt: '2024-09-25T05:20:33.019Z',
        updatedAt: '2024-09-25T05:23:40.742Z',
      };

      jest.spyOn(postService, 'findById').mockImplementation(() => result);

      expect(await postController.findById()).toBe(result);
    });
  });
});
