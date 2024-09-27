import { Test } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

describe('Controller', () => {
  let notificationController: NotificationController;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService, PrismaService],
    }).compile();

    notificationController = module.get<NotificationController>(
      NotificationController,
    );
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('findAll', () => {
    it('should return an array of notifs', async () => {
      const result = [
        {
          id: 1,
          userId: 2,
          postId: 17,
          commentId: 4,
          message:
            'John Doe replied to your message "This is a top-level comment." in "with image"',
          isRead: false,
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(notificationService, 'findAll')
        .mockImplementation(async () => result);

      expect(await notificationController.findAll()).toEqual(result);
    });
  });
});
