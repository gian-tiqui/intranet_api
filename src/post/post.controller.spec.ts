import { Test } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

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

      expect(await postController.findById(47)).toBe(result);
    });
  });

  describe('createPost', () => {
    it('should create a post and return it', async () => {
      const createPostDto: CreatePostDto = {
        userId: 2,
        deptId: 1,
        message: 'New post',
      };
      const memoFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const result = {
        pid: 51,
        ...createPostDto,
        imageLocation: 'uploads/test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(postService, 'create').mockImplementation(() => result);

      expect(await postController.createPost(createPostDto, memoFile)).toBe(
        result,
      );
    });

    it('should throw an error if memo file is not provided', async () => {
      const createPostDto: CreatePostDto = {
        userId: 2,
        deptId: 1,
        message: 'New post without file',
      };

      await expect(
        postController.createPost(createPostDto, null),
      ).rejects.toThrow('Memo file is required');
    });
  });

  describe('updateById', () => {
    it('should update a post and return it', async () => {
      const updatePostDto = {
        message: 'Updated post message',
      };
      const updatedMemoFile = {
        originalname: 'updated.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const result = {
        pid: 47,
        userId: 2,
        deptId: 1,
        message: 'Updated post message',
        imageLocation: 'uploads/updated.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(postService, 'updateById').mockImplementation(() => result);

      expect(
        await postController.updateById(47, updatePostDto, updatedMemoFile),
      ).toBe(result);
    });
  });

  describe('deleteById', () => {
    it('should delete a post and return a success message', async () => {
      const postId = 47;
      jest
        .spyOn(postService, 'deleteById')
        .mockImplementation(() => Promise.resolve());

      await expect(postController.deleteById(postId)).resolves.toBeUndefined();
    });
  });
});
