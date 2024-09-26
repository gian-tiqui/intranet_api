import { Test } from '@nestjs/testing';

import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

describe('Controller', () => {
  let Controller: CommentController;
  let Service: CommentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService],
    }).compile();

    Service = module.get<CommentService>(CommentService);
    Controller = module.get<CommentController>(CommentController);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = null;
      jest.spyOn(Service, 'findAll').mockImplementation(() => result);

      expect(await Controller.findAll()).toBe(result);
    });
  });
});
