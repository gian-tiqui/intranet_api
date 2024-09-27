import { Test } from '@nestjs/testing';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Controller', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService, PrismaService],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    commentController = module.get<CommentController>(CommentController);
  });

  describe('Controller', () => {
    it('Should be defined', () => {
      expect(commentController).toBeDefined();
    });
  });

  describe('Service', () => {
    it('Should be defined', () => {
      expect(commentService).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        {
          cid: 20,
          userId: 2,
          postId: 17,
          parentId: null,
          message: 'msg w img',
          imageLocation:
            'uploads/1727318468144-261156785-istockphoto-1443562748-612x612.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          replies: [],
        },
      ];

      jest
        .spyOn(commentService, 'findAll')
        .mockImplementation(async () => result);

      expect(await commentController.findAll()).toBe(result);
    });
  });
});
